import dotenv from "dotenv"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"
import { getVerificationCodeEmail } from  "../emailForms/getVerificationCodeEmail.js"

const { Mailer } = redisClient

dotenv.config()

async function sendNewVerificationCode(message) {
    let newCode

    try {
        newCode = await userDAO.sendNewVerificationCode(
            message["message"]["id_user"]
        )
    } catch(err) {
        logger.error("Error during setting new verification code transaction")
        throw err
    }

    await taskQueue.publish(
        Mailer,
        process.env.MAILER_STREAM_NAME,
        {
            reason: "Authentication",
            to: process.env.NODE_ENV === "development" ? 
                message["message"]["email"].split(/\+test\d+/).join("") : 
                message["message"]["email"],
            subject: "The Bible Authentication",
            html: getVerificationCodeEmail(newCode[0].code, 30, process.env.FRONT_URL)
        }
    ).catch(err => {
        logger.error("[Redis Mailer] Error sending verification code")
        throw err
    })
}

export default sendNewVerificationCode