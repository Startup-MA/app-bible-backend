import dotenv from "dotenv"
import { logger } from "./logger.js"
import redisClient from "./connections/redis.js"
import http from "http"

dotenv.config()

const { redisClientMAILER, Cache, healthRedisClient } = redisClient

export const healthServer = http.createServer(async (req, res) => {
    logger.info(req.url)

    if (req.url === "/ready") {
        res.writeHead(200)
        
        logger.info("response: /ready -> OK")
        
        return res.end("OK")
    }

    if (req.url === "/health") {
        try {

            const allPingsPromise = Promise.all([
                healthRedisClient.ping(),
                Cache.ping()
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

            logger.info("response: /ready -> health")

            return res.end("Dead")
        }
    }

    res.writeHead(404)
    return res.end()
})

