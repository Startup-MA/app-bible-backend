import dotenv from "dotenv"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"

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
                to: message["message"]["email"],
                subject: "Reset your Password",
                html: `
                    <h3>Here is your password reset link. It expires within 30 minutes</h3>
                    <a href="${process.env.FRONT_URL + "/reset/" + uuid}">Reset Your Password</a>
                    <p>If it wasn't you who tried to reset password, just ignore this email or contact us here: support@the.bible.com</p>
                    `,
            },
        ) 
    } catch(err) {
        logger.error("Error occured during sending password reseting link")
        throw err
    } 
}

export default sendResetPasswordLink