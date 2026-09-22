import passService from "../service/pass.js"
import encryptor from "../utils/encryptor.js"
import { StatusCodes } from "http-status-codes"
import { logger } from "../utils/logger.js"
import { clearUserSession } from "../utils/clearUserSession.js"

async function forgot(req, res, next) {
    const { email } = req.body

    logger.info("Sending forget password email")

    const result = await passService.forgot(email)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message
    })    
}

async function reset(req, res, next) {
    const { uuid } = req.params
    const { new_password } = req.body

    logger.info(`Resetting password for uuid: ${uuid}`)

    const result = await passService.reset(uuid, await encryptor.encrypt(new_password))

    await clearUserSession(result.data[0].id_user)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message
    })      
}

export default {
    forgot: forgot,
    reset: reset
}