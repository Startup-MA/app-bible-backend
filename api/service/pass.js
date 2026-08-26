import userDAO from "../dao/user.js"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import AppError from "../errors/AppError.js"
import { logger } from "../utils/logger.js"

const { TasksQueue } = redisClient

async function forgot(email) {
    const userData = await userDAO.findUserByEmail(email)
    
    if (!userData.length) {
        throw AppError.conflict(`There is no user with such email ${email}`)
    }

    if (userData[0].auth_provider !== "email_password") {
        throw AppError.forbidden("Forbidden. Use your authentication provider.")
    }

    try {
        await taskQueue.publish(
            TasksQueue,
            process.env.TASKS_STREAM_NAME,
            {
                processingFlowType: "sendResetPasswordLink",
                email: email
            }    
        )

        return {
            message: `Reset link will be sent to ${email}. And will be active for 30 minutes!`,
        }

    } catch(err) {
        logger.error("[Redis taskQueue] Error during publishing task to the queue")
        throw err
    }
}

async function reset(uuid, new_password) {
    const userData = await userDAO.findUserByToken("reset_passwords", uuid)

    if (!userData.length) {
        throw AppError.conflict("Reset link has expired or it is broken.")
    }

    try {
        await taskQueue.publish(
            TasksQueue,
            process.env.TASKS_STREAM_NAME,
            {
                processingFlowType: "createNewPassword",
                uuid: uuid,
                new_password: new_password
            }
        )

        return {
            message: "New password setted successfully",
        }
    } catch(err) {
        logger.error("[Redis taskQueue] Error during publishing reset password task to the queue")
        throw err
    }
}

export default {
    forgot: forgot,
    reset: reset
}