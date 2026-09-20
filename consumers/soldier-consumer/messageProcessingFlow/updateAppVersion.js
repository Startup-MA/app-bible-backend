import sysDAO from "../dao/sys.js"
import { logger } from "../utils/logger.js"

async function updateAppVersion(message) {
    try {
        await sysDAO.updateAppVersion(
            message["message"]["versions"]
        )
    } catch (err) {
        logger.error("Error occured during app version update transaction")
        throw err
    }
    
    logger.info("App version was updated!")
}

export default updateAppVersion