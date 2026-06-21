import bookmarkDAO from "../dao/bookmark.js"
import { logger } from "../utils/logger.js"

async function syncBookmarks(message) {
    try {
        await bookmarkDAO.syncBookmarks(
            JSON.parse(message["message"]["bookmarks"]),
            message["message"]["id_user"]
        )
    } catch(err) {
        logger.error("Error during bookmarks sync transaction")
        throw err
    }
}

export default syncBookmarks