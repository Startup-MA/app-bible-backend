import dotenv from "dotenv"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import userDAO from "../dao/user.js"
import { logger } from "../utils/logger.js"

const { Mailer } = redisClient

dotenv.config()

async function registerNewUser(message) {
    let newUser

    try {
        newUser = await userDAO.registerNewUser(
            message["message"]["email"],
            message["message"]["password"],
            message["message"]["code"],
        )
    } catch(err) {
        logger.error("Error during registering new user transaction")
        throw err
    }

    await taskQueue.publish(
        Mailer,
        process.env.MAILER_STREAM_NAME,
        {
            reason: "Verification",
            to: message["message"]["email"].split(/\+test\d+/).join(""),
            subject: "Verification code",
            html: `
                <p>Your verification code for ${message["message"]["email"]} <b>(Expires in 30 minutes)</b>: </p></br>
                <h1><b>${newUser[0].code}</b></h1>
            `,
        }
    ).catch(err => {
        logger.error("[Redis taskQueue] Error sending verification code")
        throw err
    })
}

export default registerNewUser