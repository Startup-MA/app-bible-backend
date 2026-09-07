import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"

async function setGoogleSub(message) {
    try {
        await userDAO.setGoogleSub(
            message["message"]["google_sub"],
            message["message"]["id_user"]
        )
    } catch (err) {
        logger.error("Error occured during user google_sub setting transaction")
        throw err
    }
    
    logger.info("User google_sub was set!")
}

export default setGoogleSub