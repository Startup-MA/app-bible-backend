import dotenv from "dotenv"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"
import { getResetPasswordEmail } from "../emailForms/getResetPasswordEmail.js"

const { Mailer } = redisClient

dotenv.config()

async function sendResetPasswordLink(message) {
    let uuid

    try {
        uuid = await userDAO.createPasswordResetLink(message["message"]["email"])
    } catch(err) {
        logger.error("Error during users reset password transaction")
        throw err
    }

    try {
        await taskQueue.publish(
            Mailer,
            process.env.MAILER_STREAM_NAME,
            {
                reason: "Password Reset",
                to: process.env.NODE_ENV === "development" ? 
                message["message"]["email"].split(/\+test\d+/).join("") : 
                message["message"]["email"],
                subject: "Reset your The Bible password",
                html: getResetPasswordEmail(30, process.env.FRONT_URL, process.env.FRONT_URL + "/reset/" + uuid, "support@the.bible.com")
            },
        ) 
    } catch(err) {
        logger.error("Error occured during sending password reseting link")
        throw err
    } 
}

export default sendResetPasswordLink