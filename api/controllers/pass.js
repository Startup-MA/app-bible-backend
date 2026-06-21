import passService from "../service/pass.js"
import encryptor from "../utils/encryptor.js"
import { StatusCodes } from "http-status-codes"
import { logger } from "../utils/logger.js"

async function forgot(req, res, next) {
    logger.info("Sending forget password email")

    const result = await passService.forgot(req.body.email)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message
    })    
}

async function reset(req, res, next) {
    const { uuid } = req.params

    logger.info(`Resetting password for uuid: ${uuid}`)

    const result = await passService.reset(uuid, await encryptor.encrypt(req.body.new_password))

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message
    })      
}

export default {
    forgot: forgot,
    reset: reset
}