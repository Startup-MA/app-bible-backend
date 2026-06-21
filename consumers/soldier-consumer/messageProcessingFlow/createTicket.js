import sysDAO from "../dao/sys.js"
import { logger } from "../utils/logger.js"

async function createTicket(message) {
    try {
        await sysDAO.createTicket(
            JSON.parse(message["message"]["ticket"]),
            message["message"]["id_user"]
        )
    } catch(err) {
        logger.error("Error during creating ticket transaction")
        throw err
    }
}

export default createTicket