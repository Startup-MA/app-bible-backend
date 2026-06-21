import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"

async function updateProfile(message) {
    try {
        await userDAO.updateProfile(
            message["message"]["id_user"],
            JSON.parse(message["message"]["updatedProfileData"])
        )
    } catch (err) {
        logger.error("Error occured during updating profile transaction")
        throw err
    }
    
    logger.info("User profile was updated!")
}

export default updateProfile