import readingHistoryDAO from "../dao/readingHistory.js"
import { logger } from "../utils/logger.js"

async function syncUserReadingHistory(message) {
    try {
        await readingHistoryDAO.syncUserReadingHistory(
            JSON.parse(message["message"]["readingHistory"]),
            message["message"]["id_user"]
        )
    } catch(err) {
        logger.error("Error during user reading history sync transaction")
        throw err
    }
}

export default syncUserReadingHistory