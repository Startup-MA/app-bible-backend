import customerDAO from "../dao/customer.js"
import userDAO from "../dao/user.js"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import AppError from "../errors/AppError.js"
import ApiGateway from "../outboundAPI/ApiGateway.js"
import { logger } from "../utils/logger.js"

const { TasksQueue } = redisClient

async function customerUpdate(data) {
    if (!data.data.customData || !data.data.customData.email) {
        throw AppError.bad_request("Custom data absence")
    }

    const user = await userDAO.findUserByEmail(data.data.customData.email)

    if (!user.length) {
        throw AppError.conflict("There is no user with such email")
    }
    
    const customer = await customerDAO.findCustomerById(data.data.customerId)

    if (!customer.length) {
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
        data: customer
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
    upgradePlan: upgradePlan
}