import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"

async function createOrUpdateUserTopics(message) {
    try {
        await userDAO.createOrUpdateUserTopics(
            message["message"]["id_user"],
            JSON.parse(message["message"]["userTopics"]) 
        )
    } catch (err) {
        logger.error("Error occured during update user topics transaction")
        throw err
    }
    
    logger.info("User topics are set!")
}

export default createOrUpdateUserTopics