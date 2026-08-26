import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"

async function updateEmail(message) {
    try {
        await userDAO.updateEmail(
            message["message"]["email"],
            message["message"]["id_user"]
        )
    } catch (err) {
        logger.error("Error occured during user email update transaction")
        throw err
    }
    
    logger.info("User email was updated!")
}

export default updateEmail