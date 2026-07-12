import customerDAO from "../dao/customer.js"
import { logger } from "../utils/logger.js"

async function addNewCustomer(message) {
    try {
        await customerDAO.addNewCustomer(
            JSON.parse(message["message"]["data"]),
            message["message"]["id_user"] 
        )
    } catch (err) {
        logger.error("Error occured during adding new customer")
        throw err
    }
    
    logger.info("New customer added!")
}

export default addNewCustomer