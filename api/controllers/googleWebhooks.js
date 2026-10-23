import { StatusCodes } from "http-status-codes"
import customerService from "../service/customer.js"
import { logger } from "../utils/logger.js"
import { clearCacheFields } from "../utils/clearCacheFields.js"

async function handler(req, res, next) {
    logger.info("Google Play notification hit")

    if (!req.body || !req.body.message || !req.body.message.data) {
        logger.warn("Google Play notification had no message data")

        return res.status(StatusCodes.OK).json({
            status: "success"
        })
    }

    let notification

    try {
        notification = JSON.parse(Buffer.from(req.body.message.data, "base64").toString("utf8"))
    } catch (err) {
        logger.warn("Google Play notification payload was not valid JSON")

        return res.status(StatusCodes.OK).json({
            status: "success"
        })
    }

    const result = await customerService.applyGooglePlayNotification(notification)

    if (result && result.id_user) {
        clearCacheFields([
            `paddle:${result.id_user}:/api/customer/getLastYearTransactions`,
            `paddle:${result.id_user}:/api/customer/getCurrentPaymentMethod`,
            `paddle:${result.id_user}:/api/customer/getSubscription`,
            `dashboard:${result.id_user}:/api/authMe`
        ])
    }

    return res.status(StatusCodes.OK).json({
        status: "success"
    })
}

export default {
    handler: handler
}
