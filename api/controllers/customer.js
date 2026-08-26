import { StatusCodes } from "http-status-codes"
import customerService from "../service/customer.js"
import { logger } from "../utils/logger.js"
import { clearCacheFields } from "../utils/clearCacheFields.js"

async function getSubscription(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Retrieving subscription info for user: ${id} device: ${device}`)

    const customerInfo = await customerService.getAllCustomerInfo(id)

    if (!customerInfo.data[0].subscription_id) {
        return res.status(StatusCodes.OK).json({
            message: "Subscription not found",
            data: 0
        })
        // throw AppError.conflict("Subscription not found")
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
        // throw AppError.conflict("Subscription not found")
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
        // throw AppError.conflict("Subscription not found")
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
        // throw AppError.conflict("Subscription not found")
    }

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
        // throw AppError.conflict("Subscription not found")
    }

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
        // throw AppError.conflict("Subscription not found")
    }

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
        // throw AppError.conflict("Subscription not found")
    }

    const upgradePlanResult = await customerService.upgradePlan(customerInfo.data[0].subscription_id, body)

    // clearCacheFields([
    //     `paddle:${id}:/api/customer/getLastYearTransactions`,
    //     `paddle:${id}:/api/customer/getCurrentPaymentMethod`,
    //     `paddle:${id}:/api/customer/getSubscription`
    // ])

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: upgradePlanResult.message,
        data: upgradePlanResult.data
    })
}

export default { 
    getSubscription: getSubscription,
    getCurrentPaymentMethod: getCurrentPaymentMethod,
    getLastYearTransactions: getLastYearTransactions,
    cancelSubscription: cancelSubscription,
    cancelScheduledCancel: cancelScheduledCancel,
    getUpdatePaymentMethodTransaction: getUpdatePaymentMethodTransaction,
    upgradePlan: upgradePlan
}