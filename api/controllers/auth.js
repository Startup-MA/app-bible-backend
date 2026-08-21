import authService from "../service/auth.js"
import encryptor from "../utils/encryptor.js"
import { StatusCodes } from "http-status-codes"
import redisClient from "../connections/redis.js"
import { logger } from "../utils/logger.js"

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

async function googleCallback(req, res, next) {
    logger.info(JSON.stringify(req.body))

    logger.info("Logging with google")

    return res.status(StatusCodes.OK).redirect(process.env.FRONT_URL)
    // return res.status(StatusCodes.OK).json({
    //     status: "success",
    //     message: "Logged in"
    // })
}

async function logout(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Logging out a user: ${id} from device: ${device}`)

    req.session.destroy(async err => {
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

    await req.session.regenerate(async err => {
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

        await req.session.save(err => {
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
    googleCallback: googleCallback,
    logout: logout,
    resetCode: resetCode,
    verifyCode: verifyCode
}