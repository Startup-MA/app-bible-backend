import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"

async function createOrUpdateUserVersePrayer(message) {
    try {
        await userDAO.createOrUpdateUserVersePrayer(
            message["message"]["id_user"],
            JSON.parse(message["message"]["userLanguage"]),
            JSON.parse(message["message"]["content"])
        )
    } catch (err) {
        logger.error("Error occured during update user verse and prayer transaction")
        throw err
    }
    
    logger.info("User verse and prayer are set!")
}

export default createOrUpdateUserVersePrayer