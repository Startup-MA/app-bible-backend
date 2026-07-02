import redisClient from "../connections/redis.js"
import { logger } from "../utils/logger.js"
import dotenv from "dotenv"

dotenv.config()

const { TasksQueue, Mailer } = redisClient

const STREAMS = [
    { key: process.env.TASKS_STREAM_NAME, group: process.env.GROUP_NAME_TASKQUEUE, client: TasksQueue },
    { key: process.env.DEAD_MESSAGES_QUEUE_NAME_TASKQUEUE, client: TasksQueue },
    { key: process.env.MAILER_STREAM_NAME, group: process.env.GROUP_NAME_EMAILS, client: Mailer },
    { key: process.env.DEAD_MESSAGES_QUEUE_NAME_EMAILS, client: Mailer }
]

async function setupRedisStreams() {
    logger.warn("Initializing Redis Streams and Consumer Groups...")

    for (const stream of STREAMS) {
        try {
            if (stream.group) {
                await stream.client.xGroupCreate(stream.key, stream.group, "$", {
                    MKSTREAM: true
                })
                
                logger.info(`Created Stream & Group: ${stream.key} -> ${stream.group}`)
            } else {
                await stream.client.xAdd(stream.key, "*", {init: "value"})
                
                logger.info(`Created Dead Stream: ${stream.key}`)
            }        
        } catch (error) {
            if (error.message.includes("BUSYGROUP")) {
                logger.error(`Group already exists: ${stream.key} -> ${stream.group}`)
            } else {
                logger.error(`Error creating group ${stream.group}:`)
                logger.error("", {stack: error.stack})
                process.exit(1)
            }
        }
    }

    logger.info("Redis setup complete.")

    await TasksQueue.quit()
    await Mailer.quit()

    process.exit(0)
}

setupRedisStreams()