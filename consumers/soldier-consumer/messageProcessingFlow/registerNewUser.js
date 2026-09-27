import dotenv from "dotenv"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"
import { getVerificationCodeEmail } from  "../emailForms/getVerificationCodeEmail.js"

const { Mailer } = redisClient

dotenv.config()

async function registerNewUser(message) {
    let newUser

    try {
        newUser = await userDAO.registerNewUser(
            message["message"]["email"],
            message["message"]["password"],
            message["message"]["auth_provider"],
            message["message"]["entity_uuid"]
        )
    } catch(err) {
        logger.error("Error during registering new user transaction")
        throw err
    }

    await taskQueue.publish(
        Mailer,
        process.env.MAILER_STREAM_NAME,
        {
            reason: "The Bible Authentication",
            to: message["message"]["email"].split(/\+test\d+/).join(""),
            subject: "The Bible Authentication",
            html: getVerificationCodeEmail(newUser[0].code, 30, process.env.FRONT_URL)
        }
    ).catch(err => {
        logger.error("[Redis Mailer] Error sending verification code")
        throw err
    })
}

export default registerNewUser