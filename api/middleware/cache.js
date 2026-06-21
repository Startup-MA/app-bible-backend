import redisClient from "../connections/redis.js"
import { logger } from "../utils/logger.js"

const { Cache } = redisClient

export const cache = (ttl, customKeyGenerator = null) => {
    return async (req, res, next) => {

        if (!Cache.isReady) {
            logger.warn("[Redis Cache] Redis is not ready. Bypassing cache for:", req.originalUrl)
            return next()
        }

        // 2. Determine the cache key
        // Default to the exact URL (good for standard GET requests).
        // Use customKeyGenerator if you need to cache based on headers, user ID, or specific body params.
        const key = customKeyGenerator 
            ? customKeyGenerator(req) 
            : `cache:${req.originalUrl}`

        try {
            // 3. Check Cache
            const cachedResponse = await Cache.get(key)

            if (cachedResponse) {
                // Cache Hit: Return data immediately
                return res.status(200).json(JSON.parse(cachedResponse))
            }

            // 4. Cache Miss: Intercept the response
            // We store the original res.json function to call it later
            const originalJson = res.json

            // Override res.json to capture the payload
            res.json = function (body) {
                // Only cache successful responses (e.g., 200 OK)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    // Store in Redis asynchronously (don't await, so we don't block the response)
                    Cache.setEx(key, ttl, JSON.stringify(body)).catch(err => {
                        logger.error("", {stack: err.stack})
                    })
                }
                
                // Call the original res.json with the body to send it to the client
                return originalJson.call(this, body)
            }

            next()

        } catch (error) {
            logger.error("", {stack: error.stack})
            next()
        }
    }
}