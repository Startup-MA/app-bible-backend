import os from "os"
import dotenv from "dotenv"
import { logger } from "../logger.js"
import { setupRedisStreams } from "../scripts/redisSetup.js"
import { sleep } from "../utils/sleep.js"
import redisClient from "../connections/redis.js"
import { messageProcessing } from "../messageHandler/handleMessage.js"

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
    while (true) {
        let pendOrRegMess
        try {
            pendOrRegMess = await redisClientMAILER.XREADGROUP(
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
    logger.info(
        `
            ---------------------------------------------------------------------------------
                Message arrived | id: ${pendOrRegMess[0]["messages"][0].id} | reason: ${pendOrRegMess[0]["messages"][0].message.reason} | dlv_count: ${pendOrRegMess[0]["messages"][0].deliveriesCounter}
            ---------------------------------------------------------------------------------
        `
    )

                if (pendOrRegMess[0]["messages"][0]["deliveriesCounter"] > deliveriesCounterLimit) {
                    await redisClientMAILER.XADD(
                        deadMessageQueueName,
                        "*",
                        {
                            "content": JSON.stringify(pendOrRegMess[0]["messages"][0])
                        }
                    )

                    await redisClientMAILER.XACKDEL(
                        streamName,
                        groupName,
                        pendOrRegMess[0]["messages"][0]["id"],
                        "KEEPREF"
                    )
                    
                    logger.warn("Message was located to the dead queue")
                    continue
                }

                await messageProcessing(pendOrRegMess[0]["messages"][0])
            
            } else {
                logger.warn("Queue is empty")
            }
        } catch (err) {
            if (err.message.includes("NOGROUP")) {
                logger.warn("Redis amnesia detected! Rebuilding streams...")

                await setupRedisStreams(redisClientMAILER) 
            } else {
    logger.error(
        `
            ---------------------------------------------------------------------------------------
                Error during message processing | id: ${pendOrRegMess && pendOrRegMess[0]["messages"][0].id} | reason: ${pendOrRegMess && pendOrRegMess[0]["messages"][0].message.reason}
            ---------------------------------------------------------------------------------------
                Error stack: ${err.stack} 
            ---------------------------------------------------------------------------------------
        `
    )

                logger.warn(`Sleep for ${SLEEP} ms.....`)
                await sleep(SLEEP)
            }
        }
    }
}


