import redisClient from "../connections/redis.js"
import { logger } from "./logger.js"

const { Cache } = redisClient

export async function forgetAppleEmail(sub) {
    await Cache.del(`apple_email:${sub}`).catch(err => {
        logger.error("[Redis Cache] Error deleting saved Apple email")
        throw err
    })
}
