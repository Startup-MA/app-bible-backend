import os from "os"
import redisClient from "../connections/redis.js"
import dotenv from "dotenv"
import handleMessge from "../messageHandler/handleMessage.js"
import sleep from "../utils/sleep.js"
import { logger } from "../utils/logger.js"

dotenv.config()

const { Rome } = redisClient

const consumerName = process.env.POD_NAME || os.hostname()

const streamName = process.env.STREAM_NAME
const deadMessageQueueName = process.env.DEAD_MESSAGES_QUEUE_NAME
const groupName = process.env.GROUP_NAME
const deliveriesCounterLimit = process.env.DELIVERIES_COUNTER_LIMIT
const COUNT = process.env.COUNT
const BLOCK = process.env.BLOCK
const CLAIM = process.env.CLAIM
const SLEEP = process.env.SLEEP

async function reader() {
    while (true) {
        try {
            const pendOrRegMess = await Rome.XREADGROUP(
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
                        await Rome.XADD(
                            deadMessageQueueName,
                            "*",
                            {
                                "content": JSON.stringify(pendOrRegMess[0]["messages"][i])
                            }
                        )

                        await Rome.XACKDEL(
                            streamName,
                            groupName,
                            pendOrRegMess[0]["messages"][i]["id"],
                            "KEEPREF"
                        )
                        
                        logger.warn("Message was located to the dead queue")
                        continue
                    }

                    await handleMessge(pendOrRegMess[0]["messages"][i])
                }
                
            } else {
                logger.warn("Queue is empty")
            }
        } catch (err) {
            logger.error("Error during XPENDING_RANGE:")
            logger.error("", {stack: err.stack})

            logger.warn(`Sleep for ${SLEEP} ms.....`)
            await sleep(SLEEP)
        }
    }
}

export default reader