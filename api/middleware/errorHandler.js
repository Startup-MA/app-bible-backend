import { StatusCodes } from "http-status-codes"
import AppError from "../errors/AppError.js"
import { logger } from "../utils/logger.js"

export function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    const message = err.message || "Something went wrong!"

    logger.error("", {stack: err.stack})

    if (err instanceof AppError) {
        return res.status(statusCode).json({
            status: "error",
            message: message
        })
    }

    return res.status(statusCode).json({
        status: "error",
        message: "Something went wrong!"
    })
} 

