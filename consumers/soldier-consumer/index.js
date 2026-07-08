import os from "os"
import dotenv from "dotenv"
import reader from "./reader/reader.js"
import { logger } from "./utils/logger.js"
import redisClient from "./connections/redis.js"
import http from "http"
import livenessDAO from "./dao/liveness.js"

dotenv.config()

const consumerName = process.env.POD_NAME || os.hostname()

const { TasksQueue, Mailer, healthRedisClient } = redisClient

const healthServer = http.createServer(async (req, res) => {
    logger.info(req.url)

    if (req.url === "/ready") {
        try {
            const pingPromise = livenessDAO.health()

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("PG Ping Timeout Exceeded")), 5000)
            )

            await Promise.race([pingPromise, timeoutPromise])

            res.writeHead(200)

            logger.info("response: /ready -> OK")

            return res.end("OK")
        } catch (error) {
            logger.error("Error during PG /ready check")
            logger.error({stack: error.stack})

            res.writeHead(503)

            logger.info("response: /ready -> BAD")

            return res.end("Booting")
        }
    }

    if (req.url === "/health") {
        try {

            const allPingsPromise = Promise.all([
                livenessDAO.health(),
                healthRedisClient.ping(),
                Mailer.ping()
            ]) 

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Redis Ping Timeout Exceeded")), 5000)
            )

            await Promise.race([allPingsPromise, timeoutPromise])
            
            res.writeHead(200)

            logger.info("response: /health -> OK")

            return res.end("OK")
        } catch (error) {
            logger.error("Error during /health check")
            logger.error({stack: error.stack})

            res.writeHead(503)
            logger.info("response: /health -> BAD")

            return res.end("Dead")
        }
    }

    res.writeHead(404)
    return res.end()
})

healthServer.listen(process.env.APP_PORT, () => {
    logger.info(`K8s Health server listening on port ${process.env.APP_PORT}`);
    logger.info(`Consumer ${consumerName} is ready!`)

   reader()
})