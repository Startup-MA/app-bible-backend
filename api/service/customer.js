import customerDAO from "../dao/customer.js"
import userDAO from "../dao/user.js"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import AppError from "../errors/AppError.js"
import ApiGateway from "../outboundAPI/ApiGateway.js"
import { logger } from "../utils/logger.js"
import {
    sandboxBlocks,
    normalizeGooglePurchase,
    sameGoogleSnapshot,
    canReplaceExistingSubscription,
    subscriptionInForce
} from "../utils/googleSubscription.js"

const { TasksQueue } = redisClient

async function customerUpdate(data) {
    if (!data.data.customData || !data.data.customData.uuid) {
        throw AppError.bad_request("Custom data absence")
    }

    const user = await userDAO.findUserByUUID(data.data.customData.uuid)

    if (!user.length) {
        throw AppError.conflict("There is no user with such uuid")
    }

    const productName = data.data.items && data.data.items[0] && data.data.items[0].product && data.data.items[0].product.name

    if (productName !== "Premium") {
        logger.warn(`Paddle subscription ${data.data.id} was ignored because the product is ${productName || "missing"}`)

        return {
            message: "Only the Premium plan is accepted.",
            data: user
        }
    }

    const existing = await customerDAO.getAllCustomerInfoById(user[0]["id_user"])

    if (existing[0].billing_provider === "google" && subscriptionInForce(existing[0])) {
        await ApiGateway.paddle.cancelSubscriptionImmediately(data.data.id)

        logger.warn(`Paddle subscription ${data.data.id} was canceled because user ${user[0]["id_user"]} already has a Google Play subscription`)

        return {
            message: "Google Play subscription is still in force. Paddle subscription was canceled.",
            data: user
        }
    }
    
    const customer = await customerDAO.findCustomerById(data.data.customerId)

    if (!existing[0].subscription_id) {
        await taskQueue.publish(
            TasksQueue,
            process.env.TASKS_STREAM_NAME,
            {
                processingFlowType: "addNewCustomer",
                data: JSON.stringify(data),
                id_user: String(user[0]["id_user"])
            }  
        ).catch(err => {
            logger.error("[Redis taskQueue] Error during publishing task to the queue")
            throw err
        })

        logger.info("New customer successfully added to the Queue!")

        return { 
            message: "New customer successfully added to the Queue!",
            data: user
        }
    }
    
    if (
        customer.length &&
        customer[0]["subscription_id"] === data.data.id &&
        customer[0]["subscription_tier"] === data.data.items[0].product.name &&
        customer[0]["subscription_status"] === data.data.status &&
        customer[0]["interval"] === data.data.items[0].price.billingCycle.interval
    ) {
        logger.warn("Customer data is the same. No update")

        return {
            message: "Customer data is the same. No update",
            data: customer
        }
    }
    
    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "updateCustomer",
            data: JSON.stringify(data),
            id_user: String(user[0]["id_user"])
        }  
    ).catch(err => {
        logger.error("[Redis taskQueue] Error during publishing task to the queue")
        throw err
    })

    logger.info("Customer successfully added to the Queue for update!")

    return {
        message: "Customer successfully added to the Queue for update!",
        data: customer.length ? customer : user
    }
}

async function getAllCustomerInfo(id_user) {
    const customerInfo = await customerDAO.getAllCustomerInfoById(id_user)

    if (!customerInfo.length) {
        throw AppError.conflict("No user with such id")
    }

    return {
        message: "Customer info",
        data: customerInfo
    }
}

async function getSubscription(subscription_id) {
    const result = await ApiGateway.paddle.getSubscription(subscription_id)
    
    return {
        message: "Subscritpion data",
        data: result
    }
}

async function getCurrentPaymentMethod(subscription_id, customer_id) {
    const result = await ApiGateway.paddle.getCurrentPaymentMethod(subscription_id, customer_id)
    
    return {
        message: "Payment method was found successfully",
        data: result
    }
}

async function getLastYearTransactions(subscription_id, customer_id) {
    const result = await ApiGateway.paddle.getLastYearTransactions(subscription_id, customer_id)

    return {
        message: "Transactions list was retrieved successfully",
        data: result
    }

}

async function cancelSubscription(subscription_id) {
    const result = await ApiGateway.paddle.cancelSubscription(subscription_id,)

    return {
        message: "Subscription was canceled successfully",
        data: result
    }
}

async function cancelScheduledCancel(subscription_id) {
    const result = await ApiGateway.paddle.cancelScheduledCancel(subscription_id)

    return {
        message: "Subscription scheduled cancel was canceled successfully",
        data: result
    }
}

async function getUpdatePaymentMethodTransaction(subscription_id) {
    const result = await ApiGateway.paddle.getUpdatePaymentMethodTransaction(subscription_id)

    return {
        message: "Update payment method transaction was retrieved successfully",
        data: result
    }
}

async function publishGoogleSubscription(id_user, record) {
    const payload = { ...record }
    delete payload.acknowledge

    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "upsertGoogleSubscription",
            data: JSON.stringify(payload),
            id_user: String(id_user)
        }
    ).catch(err => {
        logger.error("[Redis taskQueue] Error during publishing Google Play subscription")
        throw err
    })
}

async function saveGooglePurchase(id_user, existing, purchaseToken, occurredAt, notificationType, loadedPurchase = null) {
    const purchase = loadedPurchase || await ApiGateway.googlePlay.getSubscription(purchaseToken)

    if (sandboxBlocks(purchase)) {
        return { sandboxBlocked: true }
    }

    const record = normalizeGooglePurchase(purchase, {
        occurredAt,
        notificationType,
        entityUuid: existing.entity_uuid
    })

    record.purchase_token = purchaseToken
    record.subscription_id = purchaseToken

    const owner = await customerDAO.findCustomerByPurchaseToken(purchaseToken)

    if (owner.length && owner[0].id_user !== id_user) {
        throw AppError.conflict("This purchase is linked to another account")
    }

    if (!canReplaceExistingSubscription(existing, purchaseToken, purchase.linkedPurchaseToken)) {
        throw AppError.conflict("User already has a subscription")
    }

    if (!sameGoogleSnapshot(existing, record)) {
        await publishGoogleSubscription(id_user, record)
        logger.info(`Google Play subscription for user ${id_user} was added to the queue`)
    } else {
        logger.warn("Google Play subscription data is the same. No update")
    }

    if (record.acknowledge) {
        await ApiGateway.googlePlay.acknowledge(record.product_id, purchaseToken)
    }

    return {
        sandboxBlocked: false,
        record
    }
}

async function registerGooglePurchase(id_user, purchaseToken) {
    const customerInfo = await customerDAO.getAllCustomerInfoById(id_user)

    if (!customerInfo.length) {
        throw AppError.conflict("No user with such id")
    }

    const saved = await saveGooglePurchase(
        id_user,
        customerInfo[0],
        purchaseToken,
        new Date().toISOString(),
        null
    )

    if (saved.sandboxBlocked) {
        throw AppError.bad_request("Sandbox mode only accepts Google Play test purchases")
    }

    return {
        message: "Google Play subscription recorded",
        data: {
            subscription_tier: saved.record.subscription_tier,
            subscription_status: saved.record.subscription_status,
            billing_provider: "google",
            expires_at: saved.record.expires_at,
            product_id: saved.record.product_id,
            interval: saved.record.interval
        }
    }
}

async function applyGooglePlayNotification(notification) {
    if (notification.testNotification) {
        logger.info("Google Play test notification received")
        return null
    }

    if (!notification.subscriptionNotification) {
        logger.info("Google Play notification has no subscription payload")
        return null
    }

    if (notification.packageName !== process.env.GOOGLE_PLAY_PACKAGE_NAME) {
        logger.warn("Google Play notification package name does not match")
        return null
    }

    const { purchaseToken, notificationType } = notification.subscriptionNotification
    const occurredAt = notification.eventTimeMillis
        ? new Date(Number(notification.eventTimeMillis)).toISOString()
        : new Date().toISOString()

    const purchase = await ApiGateway.googlePlay.getSubscription(purchaseToken)

    if (sandboxBlocks(purchase)) {
        logger.warn("Ignored a non-test Google Play purchase because sandbox mode is on")
        return null
    }

    const externalId = purchase.externalAccountIdentifiers
        && purchase.externalAccountIdentifiers.obfuscatedExternalAccountId
    let id_user = null

    const owner = await customerDAO.findCustomerByPurchaseToken(purchaseToken)

    if (owner.length) {
        id_user = owner[0].id_user
    } else if (purchase.linkedPurchaseToken) {
        const linked = await customerDAO.findCustomerByPurchaseToken(purchase.linkedPurchaseToken)

        if (linked.length) {
            id_user = linked[0].id_user
        }
    }

    if (!id_user && externalId) {
        const found = await userDAO.findUserByUUID(externalId)

        if (found.length) {
            id_user = found[0].id_user
        }
    }

    if (!id_user) {
        logger.warn("Google Play notification could not be linked to a user")
        return null
    }

    const existingRows = await customerDAO.getAllCustomerInfoById(id_user)

    if (!existingRows.length) {
        logger.warn("Google Play notification user was not found")
        return null
    }

    let saved

    try {
        saved = await saveGooglePurchase(
            id_user,
            existingRows[0],
            purchaseToken,
            occurredAt,
            notificationType,
            purchase
        )
    } catch (err) {
        if (err.statusCode === 400 || err.statusCode === 409) {
            logger.warn(err.message)
            return null
        }

        throw err
    }

    if (saved.sandboxBlocked) {
        return null
    }

    return { id_user }
}

async function upgradePlan(subscription_id, data) {
    const result = await ApiGateway.paddle.upgradePlan(subscription_id, data)

    return {
        message: "Subscription plan was upgraded successfully",
        data: result
    }
}

export default {
    customerUpdate: customerUpdate,
    getAllCustomerInfo: getAllCustomerInfo,
    getSubscription: getSubscription,
    getCurrentPaymentMethod: getCurrentPaymentMethod,
    getLastYearTransactions: getLastYearTransactions,
    cancelSubscription: cancelSubscription,
    cancelScheduledCancel: cancelScheduledCancel,
    getUpdatePaymentMethodTransaction: getUpdatePaymentMethodTransaction,
    upgradePlan: upgradePlan,
    registerGooglePurchase: registerGooglePurchase,
    applyGooglePlayNotification: applyGooglePlayNotification
}