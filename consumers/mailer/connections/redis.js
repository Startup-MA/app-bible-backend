import { createClient } from "redis"
import { logger } from "../logger.js"
import dotenv from "dotenv"

dotenv.config()

const redisClientMAILER = await createClient({
    url: process.env.REDIS_MAILER_URL
})
.on("error", err => {
    logger.error("MAILER Redis Client Error")
    logger.error({stack: err.stack})
})
.connect()

const healthRedisClient = await redisClientMAILER
    .duplicate()
    .on("error", err => {
        logger.error("healthRedisClient Error")
        logger.error({stack: err.stack})
    }).connect()

const redisClientCache = await createClient({
        url: process.env.REDIS_CACHE_URL
    })
    .on("error", err => {
        logger.error("CACHE Redis Client Error")
        logger.error({stack: err.stack})
    })
    .connect()


export default {
    redisClientMAILER: redisClientMAILER,
    Cache: redisClientCache,
    healthRedisClient: healthRedisClient
}