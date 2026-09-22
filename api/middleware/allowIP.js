import { StatusCodes } from "http-status-codes"

const paddleAllowList = process.env.PADDLE_ALLOW_LIST.split(",")

export async function allowIPWebhook(req, res, next) {
    const ip = (req.headers["x-hookdeck-original-ip"] || req.headers["cf-connecting-ip"] || req.ip).trim()
    if (paddleAllowList.includes(ip)) return next()
    else return res.status(StatusCodes.FORBIDDEN).json({
        status: "error",
        message: "Request made from forbidden ip"
    })
}