import highlightDAO from "../dao/highlight.js"
import { logger } from "../utils/logger.js"

async function syncHighlights(message) {
    try {
        await highlightDAO.syncHighlights(
            JSON.parse(message["message"]["highlights"]),
            message["message"]["id_user"]
        )
    } catch(err) {
        logger.error("Error during highlight sync transaction")
        throw err
    }
}

export default syncHighlights
