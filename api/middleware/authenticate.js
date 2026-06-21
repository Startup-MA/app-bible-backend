import { StatusCodes } from "http-status-codes"

async function session(req, res, next) {
    if (!req.session.user || !req.session.user.id) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            status: "error",
            message: "Access forbidden"
        })
    }

    return next()
}

async function userMobile(req, res, next) {
    if (req.session.user.device !== "mobile") {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            status: "error",
            message: "Only mobile session is allowed"
        })
    }

    return next()
}

async function isAdmin(req, res, next) {
    if (!req.session.user.is_admin) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            status: "error",
            message: "Not an admin"
        })
    }

    return next()
}


export default {
    session: session,
    userMobile: userMobile,
    isAdmin: isAdmin
}