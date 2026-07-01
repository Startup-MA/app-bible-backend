import livenessService from "../service/liveness.js"
import { StatusCodes } from "http-status-codes"
import { logger } from "../utils/logger.js"

async function health(req, res, next) {
    logger.info(`Verifying /health`)

    await livenessService.health()

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: "OK"

    })     
}

async function ready(req, res, next) {
    logger.info(`Verifying /ready`)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: "OK",
    })     
}

export default {
    health: health,
    ready: ready
}