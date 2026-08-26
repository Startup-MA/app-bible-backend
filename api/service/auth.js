import userDAO from "../dao/user.js"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import encryptor from "../utils/encryptor.js"
import AppError from "../errors/AppError.js"
import ApiGateway from "../outboundAPI/ApiGateway.js"
import { decodeIdToken } from "../utils/decodeIdToken.js"
import { logger } from "../utils/logger.js"

const { TasksQueue } = redisClient

async function register(email, password) {
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
            auth_provider: "email_password"
        }  
    ).catch(err => {
        logger.error("[Redis taskQueue] Error during publishing task to the queue")
        throw err
    })

    return {
        message: "User registered and verification code sent",
    }
}

async function login(email, password) {
    let userData = []

    userData = await userDAO.findUserByEmail(email)

    if (!userData.length) {
        throw AppError.conflict("No user with such email")
    }

    if (userData[0].auth_provider !== "email_password") {
        throw AppError.forbidden("Forbidden. Use your authentication provider.")
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
            email: email
        }  
    ).catch(err => {
        logger.error("[Redis taskQueue] Error during publishing task to the queue")
        throw err
    })

    return {
        message: "Verification code sent",
    }
}

async function exchangeCodeForTokens(authCode) {
    const result = await ApiGateway.googleAuth.exchangeCodeForTokens(authCode)

    return {
        data: result
    }
}

function extractUserInfoFromToken(idToken) {
    const userInfo = decodeIdToken(idToken)

    if (!userInfo.email_verified) {
        throw AppError.forbidden("The email address attached to this Google account is unverified. Please verify your email with Google.")
    }

    return {
        data: userInfo
    }
}

async function verifyUserByGoogleIdOrEmail(googleId, email) {
    let userData = await userDAO.findUserByGoogleId(googleId)

    if (userData.length) {
        if (userData[0].email !== email) {
            await taskQueue.publish(
                TasksQueue,
                process.env.TASKS_STREAM_NAME,
                {
                    processingFlowType: "updateEmail",
                    email: email,
                    id_user: String(userData[0].id_user)
                }  
            ).catch(err => {
                logger.error("[Redis taskQueue] Error during publishing task to the queue")
                throw err
            })
        }

        return {
            message: "Logged in successfully",
            data: userData
        }
    }

    userData = await userDAO.findUserByEmail(email)

    if (userData.length) {
        await taskQueue.publish(
            TasksQueue,
            process.env.TASKS_STREAM_NAME,
            {
                processingFlowType: "setGoogleId",
                google_id: googleId,
                id_user: String(userData[0].id_user)
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

    userData = await userDAO.registerNewUser(email, "google", googleId)

    return {
        message: "Logged in successfully",
        data: userData
    }
}

async function resetCode(email, password) {
    let userData = []

    userData = await userDAO.findUserByEmail(email)

    if (!userData.length) {
        throw AppError.conflict("No user with such email")
    }

    if (userData[0].auth_provider !== "email_password") {
        throw AppError.forbidden("Forbidden. Use your authentication provider.")
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
            email: email
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
    exchangeCodeForTokens: exchangeCodeForTokens,
    extractUserInfoFromToken: extractUserInfoFromToken,
    verifyUserByGoogleIdOrEmail: verifyUserByGoogleIdOrEmail,
    resetCode: resetCode,
    verifyUserByCode: verifyUserByCode
}