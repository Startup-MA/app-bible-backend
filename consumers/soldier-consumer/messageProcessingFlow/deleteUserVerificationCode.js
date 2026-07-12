import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"

const { Mailer } = redisClient

async function deleteUserVerificationCode(message) {
    let newCode

    try {
        newCode = await userDAO.deleteUserVerificationCode(message["message"]["code"], message["message"]["id_user"])
    } catch(err) {
        logger.error("Error during deletion of user verification code transaction")
        throw err
    }
}

export default deleteUserVerificationCode