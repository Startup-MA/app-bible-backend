import customerDAO from "../dao/customer.js"
import { logger } from "../utils/logger.js"

async function upsertGoogleSubscription(message) {
    try {
        await customerDAO.upsertGoogleSubscription(
            JSON.parse(message["message"]["data"]),
            message["message"]["id_user"]
        )
    } catch (err) {
        logger.error("Error occured during Google Play subscription upsert")
        throw err
    }

    logger.info("Google Play subscription was saved!")
}

export default upsertGoogleSubscription
