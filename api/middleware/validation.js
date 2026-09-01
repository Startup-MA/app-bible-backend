import { StatusCodes } from "http-status-codes" 
import AppError from "../errors/AppError.js"

function validate(schema, location = "body") {
    return async (req, res, next) => {
        if (!schema) return next()

        if (!req[location]) throw AppError.bad_request("No required data")

        const options = {
            abortEarly: false,
            stripUnknown: true,
            errors: {
                wrap: {
                    label: false
                }
            }
        }

        const { error, value } = schema.validate(req[location], options)

        if (error) {
            const errors = error.details.map(detail => ({
                path: detail.path.join(),
                message: detail.message
            }))

            return res.status(StatusCodes.BAD_REQUEST).json({
                status: "error",
                message: "Validation error",
                errors
            })
        }
        
        if (location === "query") {
            Object.defineProperty(req, "query", {
                value: value,
                writable: true,
                configurable: true,
                enumerable: true
            })
        } else {
            req[location] = value
        }

        return next()
    }
}

export default validate