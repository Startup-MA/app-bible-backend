import userDAO from "../dao/user.js"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import encryptor from "../utils/encryptor.js"
import AppError from "../errors/AppError.js"
import ApiGateway from "../outboundAPI/ApiGateway.js"
import { decodeIdToken } from "../utils/decodeIdToken.js"
import { verifyAppleIdToken } from "../utils/verifyAppleIdToken.js"
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

function extractUserInfoFromGoogleToken(idToken) {
    const userInfo = decodeIdToken(idToken)

    if (!userInfo.email_verified) {
        throw AppError.forbidden("The email address attached to this Google account is unverified. Please verify your email with Google.")
    }

    return {
        data: userInfo
    }
}

async function verifyUserByGoogleSubOrEmail(googleSub, email) {
    let userData = await userDAO.findUserByGoogleSub(googleSub)

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
                processingFlowType: "setGoogleSub",
                google_sub: googleSub,
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

    userData = await userDAO.registerNewUser(email, "google", googleSub)

    return {
        message: "Logged in successfully",
        data: userData
    }
}

async function extractUserInfoFromAppleToken(id_token, client_id) {
    const decodedToken = await verifyAppleIdToken(id_token, client_id)

    return {
        data: decodedToken
    }
}

async function verifyUserByAppleSubOrEmail(decodedToken, code, platform) {
    let userData = await userDAO.findUserByAppleSub(decodedToken.data.sub)

    if (userData.length) {
        if (!decodedToken.data.email.endsWith("@privaterelay.appleid.com") && userData[0].email !== decodedToken.data.email) {
            await taskQueue.publish(
                TasksQueue,
                process.env.TASKS_STREAM_NAME,
                {
                    processingFlowType: "updateEmail",
                    email: decodedToken.data.email,
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
    } else if (decodedToken.data.email.endsWith("@privaterelay.appleid.com")) {
        return {
            message: "Email verification required",
            data: userData
        }
    }

    const result = await ApiGateway.appleAuth.exchangeAppleCode(code, platform)
    const refresh_token = result.refresh_token

    userData = await userDAO.findUserByEmail(decodedToken.data.email)

    if (userData.length) {
        await taskQueue.publish(
            TasksQueue,
            process.env.TASKS_STREAM_NAME,
            {
                processingFlowType: "setAppleSub",
                apple_sub: decodedToken.data.sub,
                refresh_token: refresh_token,
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
    
    userData = await userDAO.registerNewUser(decodedToken.data.email, "apple", decodedToken.data.sub, refresh_token)

    return {
        message: "Logged in successfully",
        data: userData
    }
}

async function verifyUserByAppleSub(decodedToken, email) {
    let userData = await userDAO.findUserByAppleSub(decodedToken.data.sub)

    if (userData.length) {
        if (!decodedToken.data.email.endsWith("@privaterelay.appleid.com") && userData[0].email !== decodedToken.data.email) {
            await taskQueue.publish(
                TasksQueue,
                process.env.TASKS_STREAM_NAME,
                {
                    processingFlowType: "updateEmail",
                    email: decodedToken.data.email,
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

    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "sendHiddenEmailVerificationCode",
            email: email
        }  
    ).catch(err => {
        logger.error("[Redis taskQueue] Error during publishing task to the queue")
        throw err
    })

    return {
        message: "Verification code sent",
        data: userData
    }

}

async function verifyUserByEmailAndCode(email, verCode, decodedToken, code, platform) {
    let userData = []

    userData = await userDAO.findUserByEmailAndCode(email, verCode)

    if (!userData.length) {
        throw AppError.conflict("Verification code has expired or it's invalid.")
    }

    const result = await ApiGateway.appleAuth.exchangeAppleCode(code, platform)
    const refresh_token = result.refresh_token

    userData = await userDAO.findUserByEmail(email)

    if (userData.length) {
        await taskQueue.publish(
            TasksQueue,
            process.env.TASKS_STREAM_NAME,
            {
                processingFlowType: "setAppleSub",
                apple_sub: decodedToken.data.sub,
                refresh_token: refresh_token,
                email: email,
                delete_ver_code: String(true),
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

    userData = await userDAO.registerNewUser(email, "apple", decodedToken.data.sub, refresh_token, true)

    return {
        message: "Logged in successfully",
        data: userData
    }
}

async function resetCodeForHiddenEmail(email) {
    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "sendHiddenEmailVerificationCode",
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
        throw AppError.conflict("Verification code has expired or it's invalid")
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
    extractUserInfoFromGoogleToken: extractUserInfoFromGoogleToken,
    verifyUserByGoogleSubOrEmail: verifyUserByGoogleSubOrEmail,
    verifyUserByAppleSubOrEmail: verifyUserByAppleSubOrEmail,
    verifyUserByAppleSub: verifyUserByAppleSub,
    resetCodeForHiddenEmail: resetCodeForHiddenEmail,
    extractUserInfoFromAppleToken: extractUserInfoFromAppleToken,
    resetCode: resetCode,
    verifyUserByCode: verifyUserByCode,
    verifyUserByEmailAndCode: verifyUserByEmailAndCode
}