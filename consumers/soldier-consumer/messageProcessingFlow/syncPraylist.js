import praylistDAO from "../dao/praylist.js"
import { logger } from "../utils/logger.js"

async function syncPraylist(message) {
    try {
        await praylistDAO.syncPraylist(
            JSON.parse(message["message"]["praylist"]),
            message["message"]["id_user"]
        )
    } catch(err) {
        logger.error("Error during praylist sync transaction")
        throw err
    }
}

export default syncPraylist
