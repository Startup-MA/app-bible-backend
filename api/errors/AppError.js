import { StatusCodes } from "http-status-codes"

class AppError extends Error {
    constructor(message, statusCode) {
        super(message)

        this.statusCode = statusCode
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }

    static not_acceptable(message) {
        return new AppError(message, StatusCodes.NOT_ACCEPTABLE)
    }
    
    static bad_request(message) {
        return new AppError(message, StatusCodes.BAD_REQUEST)
    }
    
    static too_many_requests(message) {
        return new AppError(message, StatusCodes.TOO_MANY_REQUESTS)
    }

    static conflict(message) {
        return new AppError(message, StatusCodes.CONFLICT)
    }

    static bad_gateway(message) {
        return new AppError(message, StatusCodes.BAD_GATEWAY)
    }

    static internal(message) {
        return new AppError(message, StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

export default AppError