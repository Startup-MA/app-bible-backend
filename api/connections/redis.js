import { createClient } from "redis"
import dotenv from "dotenv"
import { logger } from "../utils/logger.js"

dotenv.config()

const redisClientTasksQueue = await createClient({
        url: process.env.REDIS_TASKSQUEUE_URL
    })
    .on("error", err => {
        logger.error("Tasks Queue Redis Client Error")
        logger.error({stack: err.stack})
    })
    .connect()


const redisClientCache = await createClient({
        url: process.env.REDIS_CACHE_URL
    })
    .on("error", err => {
        logger.error("CACHE Redis Client Error")
        logger.error({stack: err.stack})
    })
    .connect()


export default {
    TasksQueue: redisClientTasksQueue,
    Cache: redisClientCache
}