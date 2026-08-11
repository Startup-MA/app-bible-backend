import axios from "axios"
import axiosRetry from "axios-retry"
import redisClient from "../connections/redis.js"
import AppError from "../errors/AppError.js"
import { logger } from "../utils/logger.js"

const { Cache } = redisClient

class BaseApiClient {
    constructor(config) {
        this.client = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout || 10000,
            headers: config.headers || {},
        })

        if (config.rateLimit) {
            this.rateLimitConfig = config.rateLimit
        }

        axiosRetry(this.client, { 
            retries: 3, 
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) => {
                return axiosRetry.isNetworkOrIdempotentRequestError(error)
            }
        })
    }

    async request(options) {
        if (this.rateLimitConfig && Cache.isReady) {
            const { keyPrefix, points, duration } = this.rateLimitConfig
            
            try {
                const currentRequests = await Cache.incr(keyPrefix)

                if (currentRequests === 1) {
                    await Cache.expire(keyPrefix, duration)
                }

                if (currentRequests > points) {
                    const timeRemainingSecs = await Cache.ttl(keyPrefix)
                    const waitTimeMs = (timeRemainingSecs > 0 ? timeRemainingSecs : 1) * 1000
                    
                    logger.warn("Local rate limit predictive pause")

                    throw AppError.too_many_requests("[Predictive Pause]: Third-party API rate limit exceeded=" + waitTimeMs)
                }
            } catch (rejection) {
                if (rejection instanceof AppError) {
                    // const retrySecs = Math.round(rejection.retryAfterMs / 1000) || 1
                    throw AppError.too_many_requests(rejection.message)
                } else {
                    logger.warn(`[Rate Limiter] Redis error for ${this.constructor.name}, bypassing limit`, rejection.message)
                }
            }
        }

        try {
            const response = await this.client(options)
            const responseData = response.data
            
            return responseData
        } catch (error) {
            if (error.response && error.response.status === 429) {
                const headerRetry =  error.response.headers["retry-after"] || error.response.headers["retry-after-ms"] / 1000
                const retrySecs = parseInt(headerRetry, 10) || 60

                logger.error(`[CRITICAL] Hard 429 from ${options.url}. Halting cluster for ${retrySecs}s`)

                if (this.rateLimitConfig && Cache.isReady) {
                    const { keyPrefix, points } = this.rateLimitConfig
                    try {
                        await Cache.setEx(keyPrefix, retrySecs, (points + 1).toString())
                    } catch (e) {
                        logger.error("Failed to apply cluster penalty block")
                        logger.error("", {stack: e.stack})
                    }
                }

                throw AppError.too_many_requests("[API Provider]: API rate limit reached=" + retrySecs)
            }

            this.handleError(error, options.url)
        }
    }

    handleError(error, url) {
        if (error.response) {
            logger.error(`[API Error] ${url} returned ${error.response.status}: ${JSON.stringify(error.response.data)}`)
            throw AppError.bad_gateway(`API Service Error`)
        } else if (error.request) {
            logger.error(`[API Network Error] No response received from ${url}`)
            throw AppError.bad_gateway("API Service Error")
        } else {
            logger.error(`API Configuration Error: ${error.message}`)
            throw AppError.bad_gateway(`API Service Error`)
        }
    }
}

export default BaseApiClient