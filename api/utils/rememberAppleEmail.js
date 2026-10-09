import redisClient from "../connections/redis.js"
import { logger } from "./logger.js"

const { Cache } = redisClient

const APPLE_EMAIL_TTL_SECONDS = 60 * 60 * 24 * 7

export async function rememberAppleEmail(sub, email) {
    await Cache.setEx(`apple_email:${sub}`, APPLE_EMAIL_TTL_SECONDS, email).catch(err => {
        logger.error("[Redis Cache] Error saving Apple email")
        throw err
    })
}
