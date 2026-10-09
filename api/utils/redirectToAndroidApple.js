import { StatusCodes } from "http-status-codes"
import AppError from "../errors/AppError.js"
import { androidAppleIntent } from "./androidAppleIntent.js"

export function redirectToAndroidApple(res, query) {
    const location = androidAppleIntent(query)

    if (!location) throw AppError.internal("Something went wrong!")

    return res.redirect(StatusCodes.SEE_OTHER, location)
}
