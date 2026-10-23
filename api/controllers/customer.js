import { StatusCodes } from "http-status-codes"
import customerService from "../service/customer.js"
import { logger } from "../utils/logger.js"
import { clearCacheFields } from "../utils/clearCacheFields.js"
import { assertPaddleSubscription, toPaddleShapedView } from "../utils/googleSubscription.js"

async function getSubscription(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Retrieving subscription info for user: ${id} device: ${device}`)

    const customerInfo = await customerService.getAllCustomerInfo(id)

    if (!customerInfo.data[0].subscription_id) {
        return res.status(StatusCodes.OK).json({
            message: "Subscription not found",
            data: 0
        })
    }

    if (customerInfo.data[0].billing_provider === "google") {
        return res.status(StatusCodes.OK).json({
            status: "success",
            message: "Subscription data",
            data: {
                data: toPaddleShapedView(customerInfo.data[0])
            }
        })
    }
  
    const clientSubscription = await customerService.getSubscription(customerInfo.data[0].subscription_id)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: clientSubscription.message,
        data: clientSubscription.data
    })
}

async function getCurrentPaymentMethod(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Getting current payment method for user: ${id} device: ${device}`)

    const customerInfo = await customerService.getAllCustomerInfo(id)

    if (!customerInfo.data[0].subscription_id) {
        return res.status(StatusCodes.OK).json({
            message: "Subscription not found",
            data: 0
        })
    }

    if (customerInfo.data[0].billing_provider === "google") {
        return res.status(StatusCodes.OK).json({
            message: "Subscription not found",
            data: 0
        })
    }

    const currentPaymentMethod = await customerService.getCurrentPaymentMethod(customerInfo.data[0].subscription_id, customerInfo.data[0].customer_id)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: currentPaymentMethod.message,
        data: currentPaymentMethod.data
    })
}

async function getLastYearTransactions(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Getting last year transactions for user: ${id} device: ${device}`)

    const customerInfo = await customerService.getAllCustomerInfo(id)

    if (!customerInfo.data[0].subscription_id) {
        return res.status(StatusCodes.OK).json({
            message: "Subscription not found",
            data: 0
        })
    }

    if (customerInfo.data[0].billing_provider === "google") {
        return res.status(StatusCodes.OK).json({
            message: "Subscription not found",
            data: 0
        })
    }

    const lastYearTransactions = await customerService.getLastYearTransactions(customerInfo.data[0].subscription_id, customerInfo.data[0].customer_id)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: lastYearTransactions.message,
        data: lastYearTransactions.data
    })
}

async function cancelSubscription(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Cancelling subscription for user: ${id} device: ${device}`)

    const customerInfo = await customerService.getAllCustomerInfo(id)

    if (!customerInfo.data[0].subscription_id) {
        return res.status(StatusCodes.OK).json({
            message: "Subscription not found",
            data: 0
        })
    }

    assertPaddleSubscription(customerInfo.data[0])

    const cancellationResult = await customerService.cancelSubscription(customerInfo.data[0].subscription_id)

    clearCacheFields([
        `paddle:${id}:/api/customer/getSubscription`
    ])
    
    return res.status(StatusCodes.OK).json({
        status: "success",
        message: cancellationResult.message,
        data: cancellationResult.data
    })
}

async function cancelScheduledCancel(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Cancelling subscription Scheduled Cancel for user: ${id} device: ${device}`)

    const customerInfo = await customerService.getAllCustomerInfo(id)

    if (!customerInfo.data[0].subscription_id) {
        return res.status(StatusCodes.OK).json({
            message: "Subscription not found",
            data: 0
        })
    }

    assertPaddleSubscription(customerInfo.data[0])

    const cancellationResult = await customerService.cancelScheduledCancel(customerInfo.data[0].subscription_id)

    clearCacheFields([
        `paddle:${id}:/api/customer/getSubscription`
    ])

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: cancellationResult.message,
        data: cancellationResult.data
    })
}

async function getUpdatePaymentMethodTransaction(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Getting update payment method transaction for user: ${id} device: ${device}`)

    const customerInfo = await customerService.getAllCustomerInfo(id)

    if (!customerInfo.data[0].subscription_id) {
        return res.status(StatusCodes.OK).json({
            message: "Subscription not found",
            data: 0
        })
    }

    assertPaddleSubscription(customerInfo.data[0])

    const updatePaymentMethodTransaction = await customerService.getUpdatePaymentMethodTransaction(customerInfo.data[0].subscription_id)

    clearCacheFields([
        `paddle:${id}:/api/customer/getLastYearTransactions`,
        `paddle:${id}:/api/customer/getCurrentPaymentMethod`,
        `paddle:${id}:/api/customer/getSubscription`
    ])

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: updatePaymentMethodTransaction.message,
        data: updatePaymentMethodTransaction.data
    })
}

async function upgradePlan(req, res, next) {
    const { id, device } = req.session.user
    const body = req.body

    logger.info(`Preparing upgrade of subscription plan for user: ${id} device: ${device}`)

    const customerInfo = await customerService.getAllCustomerInfo(id)

    if (!customerInfo.data[0].subscription_id) {
        return res.status(StatusCodes.OK).json({
            message: "Subscription not found",
            data: 0
        })
    }

    assertPaddleSubscription(customerInfo.data[0])

    const upgradePlanResult = await customerService.upgradePlan(customerInfo.data[0].subscription_id, body)

    clearCacheFields([
        `paddle:${id}:/api/customer/getLastYearTransactions`,
        `paddle:${id}:/api/customer/getCurrentPaymentMethod`,
        `paddle:${id}:/api/customer/getSubscription`
    ])

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: upgradePlanResult.message,
        data: upgradePlanResult.data
    })
}

async function registerGooglePurchase(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Recording Google Play subscription for user: ${id} device: ${device}`)

    const result = await customerService.registerGooglePurchase(id, req.body.purchaseToken)

    clearCacheFields([
        `paddle:${id}:/api/customer/getLastYearTransactions`,
        `paddle:${id}:/api/customer/getCurrentPaymentMethod`,
        `paddle:${id}:/api/customer/getSubscription`,
        `dashboard:${id}:/api/authMe`
    ])

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message,
        data: result.data
    })
}

export default { 
    getSubscription: getSubscription,
    getCurrentPaymentMethod: getCurrentPaymentMethod,
    getLastYearTransactions: getLastYearTransactions,
    cancelSubscription: cancelSubscription,
    cancelScheduledCancel: cancelScheduledCancel,
    getUpdatePaymentMethodTransaction: getUpdatePaymentMethodTransaction,
    upgradePlan: upgradePlan,
    registerGooglePurchase: registerGooglePurchase
}