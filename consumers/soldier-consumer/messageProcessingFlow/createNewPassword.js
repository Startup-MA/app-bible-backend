import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"

async function createNewPassword(message) {
    try {
        await userDAO.updatePassword(
            message["message"]["uuid"],
            message["message"]["new_password"] 
        )
    } catch (err) {
        logger.error("Error occured during new password setting transaction")
        throw err
    }
    
    logger.info("New password was set!")
}

export default createNewPassword