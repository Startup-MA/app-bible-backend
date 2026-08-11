import os from "os"
import dotenv from "dotenv"
import { logger } from "../logger.js"
import { setupRedisStreams } from "../scripts/redisSetup.js"
import redisClient from "../connections/redis.js"
import { messageProcessing } from "../messageHandler/handleMessage.js"
import { rateLimit } from "../rateLimits.js/rateLimits.js"
import { sleep } from "../utils/sleep.js"

dotenv.config()

const consumerName = process.env.POD_NAME || os.hostname()

const streamName = process.env.STREAM_NAME
const deadMessageQueueName = process.env.DEAD_MESSAGES_QUEUE_NAME
const groupName = process.env.GROUP_NAME
const deliveriesCounterLimit = process.env.DELIVERIES_COUNTER_LIMIT
const COUNT = process.env.COUNT
const BLOCK = process.env.BLOCK
const CLAIM = process.env.CLAIM
const SLEEP = process.env.SLEEP

const { redisClientMAILER, Cache } = redisClient

export async function readPendings() {
    const { keyPrefix, points, duration } = rateLimit

    while (true) {
        try {
            const pendOrRegMess = await redisClientMAILER.XREADGROUP(
                groupName,
                consumerName,
                {
                    key: streamName,
                    id: ">"
                }, {
                    COUNT: COUNT,
                    BLOCK: BLOCK,
                    CLAIM: CLAIM,
                }
            )
            
            if (pendOrRegMess) {
                logger.info(`Pending or regular messages: ${JSON.stringify(pendOrRegMess)}`)

                for (let i = 0; i < pendOrRegMess[0]["messages"].length; i++) {

                    if (pendOrRegMess[0]["messages"][i]["deliveriesCounter"] > deliveriesCounterLimit) {
                        await redisClientMAILER.XADD(
                            deadMessageQueueName,
                            "*",
                            {
                                "content": JSON.stringify(pendOrRegMess[0]["messages"][i])
                            }
                        )

                        await redisClientMAILER.XACKDEL(
                            streamName,
                            groupName,
                            pendOrRegMess[0]["messages"][i]["id"],
                            "KEEPREF"
                        )
                        
                        logger.warn("Message was located to the dead queue")
                        continue
                    }

                    await messageProcessing(pendOrRegMess[0]["messages"][i])
                }
                
            } else {
                logger.warn("Queue is empty")
            }
        } catch (err) {
            if (err.message.includes("NOGROUP")) {
                logger.warn("Redis amnesia detected! Rebuilding streams...")

                await setupRedisStreams(redisClientMAILER) 
            } else {
                logger.error("Error during XPENDING_RANGE:")
                logger.error("", {stack: err.stack})

                logger.warn(`Sleep for ${SLEEP} ms.....`)
                await sleep(SLEEP)
            }
        }
    }
}


