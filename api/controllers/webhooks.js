import customerService from "../service/customer.js"
import { StatusCodes } from "http-status-codes"
import { EventName } from "@paddle/paddle-node-sdk"
import { logger } from "../utils/logger.js"
import { clearCacheFields } from "../utils/clearCacheFields.js"

async function handler(req, res, next) {
    logger.info("Webhook hit")

    const eventData = req.body
    let result = ""

    switch (eventData.eventType) {
        case EventName.SubscriptionActivated:
            logger.warn(eventData.eventType);

            result = await customerService.customerUpdate(eventData)
            
            logger.info(`Subscription ${eventData.data.id} was activated for user: ${result.data[0]["id_user"]}`)
                       
            clearCacheFields([
                `paddle:${result.data[0]["id_user"]}:/api/customer/getLastYearTransactions`,
                `paddle:${result.data[0]["id_user"]}:/api/customer/getCurrentPaymentMethod`,
                `paddle:${result.data[0]["id_user"]}:/api/customer/getSubscription`
            ])

            break
        case EventName.SubscriptionTrialing:
            logger.warn(eventData.eventType);

            result = await customerService.customerUpdate(eventData)
            
            logger.info(`Subscription ${eventData.data.id} is in trialing for user: ${result.data[0]["id_user"]}`)
            
            clearCacheFields([
                `paddle:${result.data[0]["id_user"]}:/api/customer/getLastYearTransactions`,
                `paddle:${result.data[0]["id_user"]}:/api/customer/getCurrentPaymentMethod`,
                `paddle:${result.data[0]["id_user"]}:/api/customer/getSubscription`
            ])
            
            break
        case EventName.SubscriptionUpdated:
            logger.warn(eventData.eventType);

            result = await customerService.customerUpdate(eventData)
            
            logger.info(`Subscription ${eventData.data.id} was updated for user: ${result.data[0]["id_user"]}`)

            clearCacheFields([
                `paddle:${result.data[0]["id_user"]}:/api/customer/getLastYearTransactions`,
                `paddle:${result.data[0]["id_user"]}:/api/customer/getCurrentPaymentMethod`,
                `paddle:${result.data[0]["id_user"]}:/api/customer/getSubscription`
            ])

            break
        default:
            logger.warn(eventData.eventType);

    }

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message
    })
}

export default {
    handler: handler
}