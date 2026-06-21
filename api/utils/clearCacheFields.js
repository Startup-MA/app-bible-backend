import redisClient from "../connections/redis.js"
import { logger } from "../utils/logger.js"

const { Cache } = redisClient

export async function clearCacheFields(fields) {
    if (!Cache.isReady) {
        logger.warn("[Redis Cache] Redis is not ready. Bypassing cache clearing.")
        return 0
    }

    Cache.del(fields).catch((error) => {
        logger.error("", {stack: error.stack})
    })
}