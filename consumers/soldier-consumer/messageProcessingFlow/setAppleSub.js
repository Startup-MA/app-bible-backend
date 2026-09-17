import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"

async function setAppleSub(message) {
    try {
        await userDAO.setAppleSub(
            message["message"]["apple_sub"],
            message["message"]["refresh_token"],
            message["message"]["id_user"],
            message["message"]["platform"],
            Boolean(message["message"]["delete_ver_code"]),
            message["message"]["email"],
        )
    } catch (err) {
        logger.error("Error occured during user apple_sub setting transaction")
        throw err
    }
    
    logger.info("User apple_sub was set!")
}

export default setAppleSub