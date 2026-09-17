import redisClient from "../connections/redis.js"
import { logger } from "./logger.js"

const { Cache } = redisClient

export async function clearUserSession(id_user) {
    const existingSession = JSON.parse(await Cache.get(`active_session:user_${id_user}`).catch(err => {
        logger.error(`[Redis Cache] Error retrieving user active session`)
        throw err
    }))

    if (existingSession) {
        await Cache.unlink([`active_session:user_${id_user}`, ...Object.values(existingSession)]).catch(err => {
            logger.error(`[Redis Cache] Error deleting existing sessions`)
            throw err
        })
    }
}