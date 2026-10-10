import dotenv from "dotenv"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"
import { getVerificationCodeEmail } from  "../emailForms/getVerificationCodeEmail.js"

const { Mailer } = redisClient

dotenv.config()

async function sendHiddenEmailVerificationCode(message) {
    let newCode

    try {
        newCode = await userDAO.sendHiddenEmailVerificationCode(
            message["message"]["email"]
        )
    } catch(err) {
        logger.error("Error during setting hidden email verification code transaction")
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
            subject: "The Bible Authenticatione",
            html: getVerificationCodeEmail(newCode[0].code, 30, process.env.FRONT_URL)
        }
    ).catch(err => {
        logger.error("[Redis Mailer] Error sending hidden email verification code")
        throw err
    })
}

export default sendHiddenEmailVerificationCode