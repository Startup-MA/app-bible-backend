import dotenv from "dotenv"
import { logger } from "../utils/logger.js"
import pool from "../connections/pg.js"
import redisClient from "../connections/redis.js"
import redis from "../connections/redis.js"
import { server } from "../server.js"

dotenv.config()
 
const { TasksQueue, Mailer, Cache } = redisClient

export const gracefulShutdown = async (signal) => {
    logger.warn(`Received ${signal}. Starting graceful shutdown...`)

    // 2. Stop the server from accepting new connections
    server.close(async (err) => {
        if (err) {
            logger.error("Error while closing the server")
            logger.error("", {stack: err.stack})

            process.exit(1)
        }

        logger.info("Server is no longer accepting new connections.")

        // 3. Clean up external resources (e.g., databases)
        await pool.end().catch(err => {
            logger.error("Error during database cleanup")
            logger.error("", {stack: err.stack})

            process.exit(1)
        })

        await TasksQueue.close().catch(err => {
            logger.error("Error during Redis taskQueue cleanup")
            logger.error("", {stack: err.stack})

            process.exit(1)
        })

        await Mailer.close().catch(err => {
            logger.error("Error during Redis Mailer cleanup")
            logger.error("", {stack: err.stack})

            process.exit(1)
        })

        await Cache.close().catch(err => {
            logger.error("Error during Redis Cache cleanup")
            logger.error("", {stack: err.stack})

            process.exit(1)
        })
        
        logger.info("All resources cleaned up.")
        
        // 4. Exit gracefully
        logger.info("Process exiting gracefully.")
        process.exit(0);
    })

// Optional: Force shutdown if it takes too long
    setTimeout(() => {
        logger.error("Could not close connections in time. Forcing shutdown.")

        process.exit(1)
    }, 10000)
}