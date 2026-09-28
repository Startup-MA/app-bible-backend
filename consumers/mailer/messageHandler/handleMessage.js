import { Resend } from "resend"
import { logger } from "../logger.js"
import { rateLimit } from "../rateLimits.js/rateLimits.js"
import redisClient from "../connections/redis.js"
import { sleep } from "../utils/sleep.js"

const { redisClientMAILER, Cache } = redisClient

const resend = new Resend(process.env.RESEND_API_KEY)

const streamName = process.env.STREAM_NAME
const groupName = process.env.GROUP_NAME

export async function messageProcessing(message) {
    const { keyPrefix, points, duration } = rateLimit

    while (true) {
        try {
            const currentRequests = await Cache.incr(keyPrefix)

            if (currentRequests === 1) {
                await Cache.expire(keyPrefix, duration)
            }

            if (currentRequests > points) {
                const timeRemainingSecs = await Cache.ttl(keyPrefix)
                const retryAfter = (timeRemainingSecs > 0 ? timeRemainingSecs : 1) * 1000
                
                logger.warn(`Local rate limit predictive pause: ${retryAfter / 1000} s`)

                await sleep(retryAfter)

                continue
            }

            break

        } catch (rejection) {
            logger.warn("Cache error:")
            logger.error("", {stack: rejection.stack})
            logger.warn("Sending email without limits verification!")
            break
        }
    }

    const start = Date.now()

    const mailOptions = {
        from: process.env.RESEND_FROM_ADDRESS,
        ...message["message"]
    }

    let data, error

    try {
        const result = await resend.emails.send(mailOptions)

        data = result.data
        error = result.error

        if (error) {
            if (parseInt(error.statusCode, 10) === 429) {
                logger.warn(`API rate limit reached.`)
                
                if (Cache.isReady) {
                    const { keyPrefix, points, duration } = rateLimit

                    try {
                        await Cache.setEx(keyPrefix, duration, (points + 1).toString())
                    } catch (e) {
                        logger.error("Failed to apply mailer penalty block")
                        throw e
                    }
                }
            }

            throw new Error(error.message)
        }

    } catch(error) {
        throw error        
    }

    await redisClientMAILER.XACKDEL(
        streamName,
        groupName,
        message["id"],
        "KEEPREF"
    )

    const end = Date.now()

    logger.info(
        `
            -------------------------------------------------------------------------------------------------------------------------------------
                Email sent | id: ${message.id} | reason: ${message.message.reason} | eid: ${data ? data.id : null} | time: ${end - start}ms
            -------------------------------------------------------------------------------------------------------------------------------------
        `
    )
}