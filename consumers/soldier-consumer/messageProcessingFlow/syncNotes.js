import noteDAO from "../dao/note.js"
import { logger } from "../utils/logger.js"

async function syncNotes(message) {
    try {
        await noteDAO.syncNotes(
            JSON.parse(message["message"]["notes"]),
            message["message"]["id_user"]
        )
    } catch(err) {
        logger.error("Error during notes sync transaction")
        throw err
    }
}

export default syncNotes
