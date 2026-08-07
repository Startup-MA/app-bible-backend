import prayerDAO from "../dao/prayer.js"
import { logger } from "../utils/logger.js"

async function syncPrayers(message) {
    try {
        await prayerDAO.syncPrayers(
            JSON.parse(message["message"]["prayers"]),
            message["message"]["id_user"]
        )
    } catch(err) {
        logger.error("Error during prayers sync transaction")
        throw err
    }
}

export default syncPrayers
