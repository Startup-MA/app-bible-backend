import userDAO from "../dao/user.js"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import encryptor from "../utils/encryptor.js"
import AppError from "../errors/AppError.js"
import { logger } from "../utils/logger.js"

const { TasksQueue } = redisClient

async function register(email, password, code) {
    const userData = await userDAO.findUserByEmail(email)
    
    if (userData.length) {
        throw AppError.conflict("User with such email already exists")
    }

    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "registerNewUser",
            email: email,
            password: password,
            code: code
        }  
    ).catch(err => {
        logger.error("[Redis taskQueue] Error during publishing task to the queue")
        throw err
    })

    return {
        message: "User registered and verification code sent",
    }
}

async function login(email, password, code) {
    let userData = []

    userData = await userDAO.findUserByEmail(email)

    if (!userData.length) {
        throw AppError.conflict("No user with such email")
    }

    const match = await encryptor.verify(password, userData[0]["password"])

    if (!match) {
        throw AppError.conflict("Invalid password")
    }
    
    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "sendNewVerificationCode",
            id_user: String(userData[0]["id_user"]),
            email: email,
            code: code // vremenno
        }  
    ).catch(err => {
        logger.error("[Redis taskQueue] Error during publishing task to the queue")
        throw err
    })

    return {
        message: "Verification code sent",
    }
}

async function resetCode(email, password, code) {
    let userData = []

    userData = await userDAO.findUserByEmail(email)

    if (!userData.length) {
        throw AppError.conflict("No user with such email")
    }

    const match = await encryptor.verify(password, userData[0]["password"])

    if (!match) {
        throw AppError.conflict("Invalid password")
    }
    
    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "sendNewVerificationCode",
            id_user: String(userData[0]["id_user"]),
            email: email,
            code: code
        }  
    ).catch(err => {
        logger.error("[Redis taskQueue] Error during publishing task to the queue")
        throw err
    })

    return {
        message: "Verification code sent again",
    }
}

async function verifyUserByCode(code) {
    let userData = []

    userData = await userDAO.findUserByCode(code)

    if (!userData.length) {
        throw AppError.conflict("Verification code has expired or it's broken")
    }

    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "deleteUserVerificationCode",
            id_user: String(userData[0]["id_user"]),
            code: String(code),
        }  
    ).catch(err => {
        logger.error("[Redis taskQueue] Error during publishing task to the queue")
        throw err
    })

    return {
        message: "Logged in successfully",
        data: userData
    }
}

export default {
    register: register,
    login: login,
    resetCode: resetCode,
    verifyUserByCode: verifyUserByCode
}