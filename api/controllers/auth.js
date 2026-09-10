import authService from "../service/auth.js"
import encryptor from "../utils/encryptor.js"
import { randomUUID, randomInt } from "crypto"
import { StatusCodes } from "http-status-codes"
import redisClient from "../connections/redis.js"
import { logger } from "../utils/logger.js"
import AppError from "../errors/AppError.js"

const { Cache } = redisClient

async function registration(req, res, next) {
    const { email, password } = req.body 

    logger.info(`Registering new user`)

    const result = await authService.register(
        email,
        await encryptor.encrypt(password)
    )

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message
    })     
}

async function login(req, res, next) {
    const { email, password } = req.body

    logger.info("Logging a user")

    const result = await authService.login(
        email,
        password
    )
        
    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message,
    })
}

async function googleAuth(req, res, next) {
    const { code } = req.query
    const device = req.query.state

    logger.info(`Logging a user using Google Auth Service from device: ${device}`)

    const userTokens = await authService.exchangeCodeForTokens(code)

    const extractedData = authService.extractUserInfoFromGoogleToken(userTokens.data.id_token)

    const userData = await authService.verifyUserByGoogleSubOrEmail(extractedData.data.sub, extractedData.data.email)

    const trackerKey = `active_session:user_${userData.data[0]["id_user"]}`
    
    const existingSession = JSON.parse(await Cache.get(trackerKey).catch(err => {
        logger.error(`[Redis Cache] Error extracting existing session from cache by trackerKey ${trackerKey}`)
        throw err
    })) || {mobile: "", browser: ""}

    const returnedObject = {
        status: "success",
        message: ""
    }
        
    if (device === "mobile") {
        const del = await Cache.del(existingSession[device]).catch(err => {
            logger.error(`[Redis Cache] Error deleting existing session: ${existingSession[device]} device: ${device}`)
            throw err
        })

        if (del) {
            returnedObject["message"] = `Session ${existingSession[device]} was closed. Only one session available on mobile!`
        }
    } else if (device === "browser") {
        const del = await Cache.del(existingSession[device]).catch(err => {
            logger.error(`[Redis Cache] Error deleting existing session: ${existingSession[device]} device: ${device}`)
            throw err
        })
        
        if (del) {
            returnedObject["message"] = `Session ${existingSession[device]} was closed. Only one session available in browser!`
        }
    }

    req.session.regenerate(async err => {
        if (err) throw err

        req.session.user = {
            id: userData.data[0]["id_user"],
            device: device,
            is_admin: userData.data[0]["is_admin"]
        }

        if (device === "mobile") {
            existingSession[device] = "sess:" + req.sessionID
            
            await Cache.set(
                trackerKey,
                JSON.stringify(existingSession)
            ).catch(err => {
                logger.error(`[Redis Cache] Error setting existing session: ${existingSession[device]} device: ${device}`)
                throw err
            })
        } else {
            existingSession[device] = "sess:" + req.sessionID

            await Cache.set(
                trackerKey,
                JSON.stringify(existingSession)
            ).catch(err => {
                logger.error(`[Redis Cache] Error setting existing session: ${existingSession[device]} device: ${device}`)
                throw err
            })
        }

        req.session.save(err => {
            if (err) throw err
            
            if (device === "browser") {
                return res.redirect(`${process.env.FRONT_URL}/dashboard/profile`)
            }
            
            return res
                .status(StatusCodes.OK)
                .header("sess", JSON.stringify(returnedObject))
                .json({
                    status: "success",
                    message: userData.message
                })
        })
    })
}

async function appleAuth(req, res, next) {
    const { code, id_token } = req.body
    const { device, platform } = JSON.parse(req.body.state)

    logger.info(`Logging a user using Apple Auth Service from device: ${device} platform: ${platform}`)

    const decodedToken = await authService.extractUserInfoFromAppleToken(
        id_token,
        platform === "web" ? process.env.APPLE_SERVICE_ID : process.env.APPLE_APP_ID
    )
    
    const userData = await authService.verifyUserByAppleSubOrEmail(decodedToken, code, platform)

    if (!userData.data.length) {
        const pendingId = randomUUID()

        const pendingUserData = {
            code: code,
            decodedToken: decodedToken,
            device: device,
            platform: platform
        }

        await Cache.setEx(`pending_signup:${pendingId}`, 900, JSON.stringify(pendingUserData)).catch(err => {
            logger.error("[Redis Cache] Error writing pending user signup data")
            throw err
        })
        
        return device === "browser" ? 
            res.redirect(`${process.env.FRONT_URL}/verifyEmail/${pendingId}`) :
            res.status(StatusCodes.OK)
                .json({
                    status: "success",
                    message: userData.message,
                    data: {
                        uuid: pendingId
                    }
                })
    }

    const trackerKey = `active_session:user_${userData.data[0]["id_user"]}`
    
    const existingSession = JSON.parse(await Cache.get(trackerKey).catch(err => {
        logger.error(`[Redis Cache] Error extracting existing session from cache by trackerKey ${trackerKey}`)
        throw err
    })) || {mobile: "", browser: ""}

    const returnedObject = {
        status: "success",
        message: ""
    }
        
    if (device === "mobile") {
        const del = await Cache.del(existingSession[device]).catch(err => {
            logger.error(`[Redis Cache] Error deleting existing session: ${existingSession[device]} device: ${device}`)
            throw err
        })

        if (del) {
            returnedObject["message"] = `Session ${existingSession[device]} was closed. Only one session available on mobile!`
        }
    } else if (device === "browser") {
        const del = await Cache.del(existingSession[device]).catch(err => {
            logger.error(`[Redis Cache] Error deleting existing session: ${existingSession[device]} device: ${device}`)
            throw err
        })
        
        if (del) {
            returnedObject["message"] = `Session ${existingSession[device]} was closed. Only one session available in browser!`
        }
    }

    req.session.regenerate(async err => {
        if (err) throw err

        req.session.user = {
            id: userData.data[0]["id_user"],
            device: device,
            is_admin: userData.data[0]["is_admin"]
        }

        if (device === "mobile") {
            existingSession[device] = "sess:" + req.sessionID
            
            await Cache.set(
                trackerKey,
                JSON.stringify(existingSession)
            ).catch(err => {
                logger.error(`[Redis Cache] Error setting existing session: ${existingSession[device]} device: ${device}`)
                throw err
            })
        } else {
            existingSession[device] = "sess:" + req.sessionID

            await Cache.set(
                trackerKey,
                JSON.stringify(existingSession)
            ).catch(err => {
                logger.error(`[Redis Cache] Error setting existing session: ${existingSession[device]} device: ${device}`)
                throw err
            })
        }

        req.session.save(err => {
            if (err) throw err
            
            if (device === "browser") {
                return res.redirect(`${process.env.FRONT_URL}/dashboard/profile`)
            }
            
            return res
                .status(StatusCodes.OK)
                .header("sess", JSON.stringify(returnedObject))
                .json({
                    status: "success",
                    message: userData.message
                })
        })
    })
}

async function hiddenEmailVerify(req, res, next) {
    const { uuid } = req.params
    const { email } = req.body

    const rawData = await Cache.get(`pending_signup:${uuid}`).catch(err => {
        logger.error("[Redis Cache] Error extracting user pending data from cache by uuid")
        throw err
    })

    if (!rawData) throw AppError.conflict("Provided UUID is expired or invalid.")

    const pendingUserData = JSON.parse(rawData) 
    
    const { code, decodedToken, device, platform } = pendingUserData
    
    logger.info(`Verifying user email hidden in Apple Auth Service`)

    const userData = await authService.verifyUserByAppleSub(decodedToken, email)

    if (!userData.data.length) {
        return res.status(StatusCodes.OK)
            .json({
                status: "success",
                message: userData.message
            })
    }

    await Cache.del(`pending_signup:${uuid}`).catch(err => {
        logger.error(`[Redis Cache] Error deleting pending user signup data`)
        throw err
    })

    const trackerKey = `active_session:user_${userData.data[0]["id_user"]}`
    
    const existingSession = JSON.parse(await Cache.get(trackerKey).catch(err => {
        logger.error(`[Redis Cache] Error extracting existing session from cache by trackerKey ${trackerKey}`)
        throw err
    })) || {mobile: "", browser: ""}

    const returnedObject = {
        status: "success",
        message: ""
    }
        
    if (device === "mobile") {
        const del = await Cache.del(existingSession[device]).catch(err => {
            logger.error(`[Redis Cache] Error deleting existing session: ${existingSession[device]} device: ${device}`)
            throw err
        })

        if (del) {
            returnedObject["message"] = `Session ${existingSession[device]} was closed. Only one session available on mobile!`
        }
    } else if (device === "browser") {
        const del = await Cache.del(existingSession[device]).catch(err => {
            logger.error(`[Redis Cache] Error deleting existing session: ${existingSession[device]} device: ${device}`)
            throw err
        })
        
        if (del) {
            returnedObject["message"] = `Session ${existingSession[device]} was closed. Only one session available in browser!`
        }
    }

    req.session.regenerate(async err => {
        if (err) throw err

        req.session.user = {
            id: userData.data[0]["id_user"],
            device: device,
            is_admin: userData.data[0]["is_admin"]
        }

        if (device === "mobile") {
            existingSession[device] = "sess:" + req.sessionID
            
            await Cache.set(
                trackerKey,
                JSON.stringify(existingSession)
            ).catch(err => {
                logger.error(`[Redis Cache] Error setting existing session: ${existingSession[device]} device: ${device}`)
                throw err
            })
        } else {
            existingSession[device] = "sess:" + req.sessionID

            await Cache.set(
                trackerKey,
                JSON.stringify(existingSession)
            ).catch(err => {
                logger.error(`[Redis Cache] Error setting existing session: ${existingSession[device]} device: ${device}`)
                throw err
            })
        }

        req.session.save(err => {
            if (err) throw err
            
            return res
                .status(StatusCodes.OK)
                .header("sess", JSON.stringify(returnedObject))
                .json({
                    status: "success",
                    message: userData.message
                })
        })
    })
}

async function hiddenEmailCodeVerify(req, res, next) {
    const { uuid } = req.params
    const { email, verCode } = req.body
    
    const rawData = await Cache.get(`pending_signup:${uuid}`).catch(err => {
        logger.error("[Redis Cache] Error extracting user pending data from cache by uuid")
        throw err
    })

    if (!rawData) throw AppError.conflict("Provided UUID is expired or invalid.")
    
    const pendingUserData = JSON.parse(rawData)

    const { code, decodedToken, device, platform } = pendingUserData

    logger.info(`Verifying user code for hidden email in Apple Auth Service`)

    const userData = await authService.verifyUserByEmailAndCode(email, verCode, decodedToken, code, platform)
    
    await Cache.del(`pending_signup:${uuid}`).catch(err => {
        logger.error(`[Redis Cache] Error deleting pending user signup data`)
        throw err
    })

    const trackerKey = `active_session:user_${userData.data[0]["id_user"]}`
    
    const existingSession = JSON.parse(await Cache.get(trackerKey).catch(err => {
        logger.error(`[Redis Cache] Error extracting existing session from cache by trackerKey ${trackerKey}`)
        throw err
    })) || {mobile: "", browser: ""}

    const returnedObject = {
        status: "success",
        message: ""
    }
        
    if (device === "mobile") {
        const del = await Cache.del(existingSession[device]).catch(err => {
            logger.error(`[Redis Cache] Error deleting existing session: ${existingSession[device]} device: ${device}`)
            throw err
        })

        if (del) {
            returnedObject["message"] = `Session ${existingSession[device]} was closed. Only one session available on mobile!`
        }
    } else if (device === "browser") {
        const del = await Cache.del(existingSession[device]).catch(err => {
            logger.error(`[Redis Cache] Error deleting existing session: ${existingSession[device]} device: ${device}`)
            throw err
        })
        
        if (del) {
            returnedObject["message"] = `Session ${existingSession[device]} was closed. Only one session available in browser!`
        }
    }

    req.session.regenerate(async err => {
        if (err) throw err

        req.session.user = {
            id: userData.data[0]["id_user"],
            device: device,
            is_admin: userData.data[0]["is_admin"]
        }

        if (device === "mobile") {
            existingSession[device] = "sess:" + req.sessionID
            
            await Cache.set(
                trackerKey,
                JSON.stringify(existingSession)
            ).catch(err => {
                logger.error(`[Redis Cache] Error setting existing session: ${existingSession[device]} device: ${device}`)
                throw err
            })
        } else {
            existingSession[device] = "sess:" + req.sessionID

            await Cache.set(
                trackerKey,
                JSON.stringify(existingSession)
            ).catch(err => {
                logger.error(`[Redis Cache] Error setting existing session: ${existingSession[device]} device: ${device}`)
                throw err
            })
        }

        req.session.save(err => {
            if (err) throw err
            
            return res
                .status(StatusCodes.OK)
                .header("sess", JSON.stringify(returnedObject))
                .json({
                    status: "success",
                    message: userData.message
                })
        })
    })
}

async function hiddenEmailCodeReset(req, res, next) {
    const { uuid } = req.params
    const { email } = req.body

    const rawData = await Cache.get(`pending_signup:${uuid}`).catch(err => {
        logger.error("[Redis Cache] Error extracting user pending data from cache by uuid")
        throw err
    })

    if (!rawData) throw AppError.conflict("Provided UUID is expired or invalid.")
    
    const pendingUserData = JSON.parse(rawData)

    const { device, platform } = pendingUserData

    logger.info(`Resetting user code for hidden email in Apple Auth Service`)
    
    const result = await authService.resetCodeForHiddenEmail(email)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message
    })
}

async function logout(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Logging out a user: ${id} from device: ${device}`)

    req.session.destroy(err => {
        if (err) throw err

        return res.status(StatusCodes.OK).json({
            status: "success",
            message: "User successfully logged out"
        })
    })
}

async function resetCode(req, res, next) {
    const { email, password } = req.body

    logger.info(`Resetting code for a user`)

    const result = await authService.resetCode(
        email,
        password
    )
    
    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message
    })
}

async function verifyCode(req, res, next) {
    const {device, code} = req.body

    logger.info(`Verifying a user code: ${code} for device: ${device}`)

    const result = await authService.verifyUserByCode(code)
    
    const trackerKey = `active_session:user_${result.data[0]["id_user"]}`
    
    const existingSession = JSON.parse(await Cache.get(trackerKey).catch(err => {
        logger.error(`[Redis Cache] Error extracting existing session from cache by trackerKey ${trackerKey}`)
        throw err
    })) || {mobile: "", browser: ""}

    const returnedObject = {
        status: "success",
        message: ""
    }
        
    if (device === "mobile") {
        const del = await Cache.del(existingSession[device]).catch(err => {
            logger.error(`[Redis Cache] Error deleting existing session: ${existingSession[device]} device: ${device}`)
            throw err
        })

        if (del) {
            returnedObject["message"] = `Session ${existingSession[device]} was closed. Only one session available on mobile!`
        }
    } else if (device === "browser") {
        const del = await Cache.del(existingSession[device]).catch(err => {
            logger.error(`[Redis Cache] Error deleting existing session: ${existingSession[device]} device: ${device}`)
            throw err
        })
        
        if (del) {
            returnedObject["message"] = `Session ${existingSession[device]} was closed. Only one session available in browser!`
        }
    }

    req.session.regenerate(async err => {
        if (err) throw err

        req.session.user = {
            id: result.data[0]["id_user"],
            device: device,
            is_admin: result.data[0]["is_admin"]
        }

        if (device === "mobile") {
            existingSession[device] = "sess:" + req.sessionID
            
            await Cache.set(
                trackerKey,
                JSON.stringify(existingSession)
            ).catch(err => {
                logger.error(`[Redis Cache] Error setting existing session: ${existingSession[device]} device: ${device}`)
                throw err
            })
        } else {
            existingSession[device] = "sess:" + req.sessionID

            await Cache.set(
                trackerKey,
                JSON.stringify(existingSession)
            ).catch(err => {
                logger.error(`[Redis Cache] Error setting existing session: ${existingSession[device]} device: ${device}`)
                throw err
            })
        }

        req.session.save(err => {
            if (err) throw err

            return res
                .status(StatusCodes.OK)
                .header("sess", JSON.stringify(returnedObject))
                .json({
                    status: "success",
                    message: result.message
                })
        })
    })
}

export default {
    registration: registration,
    login: login,
    googleAuth: googleAuth,
    appleAuth: appleAuth,
    hiddenEmailVerify: hiddenEmailVerify,
    hiddenEmailCodeVerify: hiddenEmailCodeVerify,
    hiddenEmailCodeReset: hiddenEmailCodeReset,
    logout: logout,
    resetCode: resetCode,
    verifyCode: verifyCode
}