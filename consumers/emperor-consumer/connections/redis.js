import { createClient } from "redis"
import dotenv from "dotenv"
import { logger } from "../utils/logger.js"

dotenv.config()

const redisClientRome = await createClient({
        url: process.env.REDIS_ROME_URL
    })
    .on("error", err => {
        logger.error("ROME Redis Client Error")
        logger.error({stack: err.stack})
    })
    .connect()

const redisClientMailer = await createClient({
        url: process.env.REDIS_MAILER_URL
    })
    .on("error", err => {
        logger.error("MAILER Redis Client Error")
        logger.error({stack: err.stack})
    })
    .connect()


export default {
    Rome: redisClientRome,
    Mailer: redisClientMailer,
}