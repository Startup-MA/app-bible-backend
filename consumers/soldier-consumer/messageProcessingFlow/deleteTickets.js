import sysDAO from "../dao/sys.js"
import { logger } from "../utils/logger.js"

async function deleteTickets(message) {
    try {
        await sysDAO.deleteTickets(
            message["message"]["from"],
            message["message"]["to"]
        )
    } catch(err) {
        logger.error("Error during tickets deletion transaction")
        throw err
    }
}

export default deleteTickets