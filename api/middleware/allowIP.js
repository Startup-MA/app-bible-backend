import { StatusCodes } from "http-status-codes"

const paddleAllowList = process.env.PADDLE_ALLOW_LIST.split(",")

export async function allowIPWebhook(req, res, next) {
    const ip = ((req.ip || req.socket.remoteAddress || req.connection.remoteAddress || "").split(":")[3] ||  req.headers["x-hookdeck-original-ip"]).trim()
    if (paddleAllowList.includes(ip)) return next()
    else return res.status(StatusCodes.FORBIDDEN).json({
        status: "error",
        message: "Request made from forbidden ip"
    })
}