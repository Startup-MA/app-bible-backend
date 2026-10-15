import os from "os"
import redisClient from "../connections/redis.js"
import dotenv from "dotenv"
import handleMessge from "../messageHandler/handleMessage.js"
import sleep from "../utils/sleep.js"
import { logger } from "../utils/logger.js"
import { setupRedisStreams } from "../scripts/redisSetup.js"

dotenv.config()

const { TasksQueue } = redisClient

const consumerName = process.env.POD_NAME || os.hostname()

const streamName = process.env.TASKS_STREAM_NAME
const deadMessageQueueName = process.env.DEAD_MESSAGES_QUEUE_NAME
const groupName = process.env.GROUP_NAME
const deliveriesCounterLimit = process.env.DELIVERIES_COUNTER_LIMIT
const COUNT = process.env.COUNT
const BLOCK = process.env.BLOCK
const CLAIM = process.env.CLAIM
const SLEEP = process.env.SLEEP

async function reader() {
    while (true) {
        let pendOrRegMess

        try {
            pendOrRegMess = await TasksQueue.XREADGROUP(
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
            -----------------------------------------------------------------------------------------------
                Message arrived | id: ${pendOrRegMess[0]["messages"][0].id} | flow type: ${pendOrRegMess[0]["messages"][0].message.processingFlowType} | dlv_count: ${pendOrRegMess[0]["messages"][0].deliveriesCounter}
            -----------------------------------------------------------------------------------------------
        `
    )

                if (pendOrRegMess[0]["messages"][0]["deliveriesCounter"] > deliveriesCounterLimit) {
                    await TasksQueue.XADD(
                        deadMessageQueueName,
                        "*",
                        {
                            "content": JSON.stringify(pendOrRegMess[0]["messages"][0])
                        }
                    )

                    await TasksQueue.XACKDEL(
                        streamName,
                        groupName,
                        pendOrRegMess[0]["messages"][0]["id"],
                        "KEEPREF"
                    )
                    
                    logger.warn("Message was located to the dead queue")
                    continue
                }

                await handleMessge(pendOrRegMess[0]["messages"][0])
            } else {
                logger.warn("Queue is empty")
            }
        } catch (err) {
            if (err.message.includes("NOGROUP")) {
                logger.warn("Redis amnesia detected! Rebuilding streams...")

                await setupRedisStreams(TasksQueue) 
            } else {
    logger.error(
        `
            ---------------------------------------------------------------------------------------
                Error during message processing | id: ${pendOrRegMess && pendOrRegMess[0]["messages"][0].id} | flow type: ${pendOrRegMess && pendOrRegMess[0]["messages"][0].message.processingFlowType}
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

export default reader