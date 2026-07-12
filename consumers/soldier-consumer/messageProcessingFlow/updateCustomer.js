import customerDAO from "../dao/customer.js"
import { logger } from "../utils/logger.js"

async function updateCustomer(message) {
    try {
        await customerDAO.updateCustomer(
            JSON.parse(message["message"]["data"]),
            message["message"]["id_user"] 
        )
    } catch (err) {
        logger.error("Error occured during updating customer")
        throw err
    }
    
    logger.info("Customer updated!")
}

export default updateCustomer