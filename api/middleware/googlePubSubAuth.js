import { OAuth2Client } from "google-auth-library"
import AppError from "../errors/AppError.js"
import { logger } from "../utils/logger.js"

const client = new OAuth2Client()

export async function googlePubSubAuth(req, res, next) {
    const audience = process.env.GOOGLE_PUBSUB_PUSH_AUDIENCE
    const expectedEmail = process.env.GOOGLE_PUBSUB_SERVICE_ACCOUNT_EMAIL

    if (!audience || !expectedEmail) {
        logger.error("Google Pub/Sub push authentication is not configured")
        return next(AppError.bad_gateway("API Service Error"))
    }

    const header = String(req.headers.authorization || "")
    const token = header.startsWith("Bearer ") ? header.slice(7) : ""

    if (!token) {
        return next(AppError.forbidden("Missing Pub/Sub token"))
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience
        })
        const payload = ticket.getPayload()

        if (!payload || payload.email_verified !== true || payload.email !== expectedEmail) {
            return next(AppError.forbidden("Unexpected Pub/Sub identity"))
        }

        return next()
    } catch (err) {
        logger.warn(`Google Pub/Sub token was rejected: ${err.message}`)
        return next(AppError.forbidden("Invalid Pub/Sub token"))
    }
}
