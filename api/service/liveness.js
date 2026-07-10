import livenessDAO from "../dao/liveness.js"
import redisClient from "../connections/redis.js"
import { logger } from "../utils/logger.js"

const { TasksQueue, Mailer, Cache } = redisClient

async function health() {
    const allPingsPromise = Promise.all([
        livenessDAO.health(),
        TasksQueue.ping(),
        Mailer.ping(),
        Cache.ping()
    ])

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Postgres/Redis Ping Timeout Exceeded")), 5000)
    )

    await Promise.race([allPingsPromise, timeoutPromise])
}

export default {
    health: health
}