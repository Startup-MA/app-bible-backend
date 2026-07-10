import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"

async function skipPersonalInfo(message) {
    try {
        await userDAO.skipPersonalInfo(message["message"]["id_user"])
    } catch (err) {
        logger.error("Error occured during skiping profile info transaction")
        throw err
    }
    
    logger.info("User profile info modal skipped!")
}

export default skipPersonalInfo