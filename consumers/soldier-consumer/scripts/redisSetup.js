import { logger } from "../utils/logger.js"
import dotenv from "dotenv"

dotenv.config()

const STREAM = { key: process.env.TASKS_STREAM_NAME, group: process.env.GROUP_NAME }

export async function setupRedisStreams(client) {
    logger.warn("Initializing Redis Streams and Consumer Groups...")

    try {
        await client.xGroupCreate(STREAM.key, STREAM.group, "$", {
            MKSTREAM: true
        })
        
        logger.info(`Created Stream & Group: ${STREAM.key} -> ${STREAM.group}`)
        
    } catch (error) {
        if (error.message.includes("BUSYGROUP")) {
            logger.error(`Group already exists: ${STREAM.key} -> ${STREAM.group}`)
        } else {
            logger.error(`Error creating group ${STREAM.group}:`)
            logger.error("", {stack: error.stack})
        }
    }

    logger.info("Redis setup complete.")
}