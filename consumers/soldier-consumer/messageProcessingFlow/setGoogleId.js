import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"

async function setGoogleId(message) {
    try {
        await userDAO.setGoogleId(
            message["message"]["google_id"],
            message["message"]["id_user"]
        )
    } catch (err) {
        logger.error("Error occured during user google_id setting transaction")
        throw err
    }
    
    logger.info("User google_id was set!")
}

export default setGoogleId