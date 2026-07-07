import os from "os"
import { createClient } from "redis"
import dotenv from "dotenv"
import nodemailer from "nodemailer"
import { Resend } from "resend"
import { logger } from "./logger.js"
import { setupRedisStreams } from "./scripts/redisSetup.js"
import http from "http"

dotenv.config()

const consumerName = process.env.POD_NAME || os.hostname()

const resend = new Resend(process.env.RESEND_API_KEY)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const redisClientMAILER = await createClient({
    url: process.env.REDIS_MAILER_URL
})
.on("error", err => {
    logger.error("MAILER Redis Client Error")
    logger.error({stack: err.stack})
})
.connect()

const healthRedisClient = await redisClientMAILER
    .duplicate()
    .on("error", err => {
        logger.error("healthRedisClient Error")
        logger.error({stack: err.stack})
    }).connect()

const streamName = process.env.STREAM_NAME
const deadMessageQueueName = process.env.DEAD_MESSAGES_QUEUE_NAME
const groupName = process.env.GROUP_NAME
const deliveriesCounterLimit = process.env.DELIVERIES_COUNTER_LIMIT
const COUNT = process.env.COUNT
const BLOCK = process.env.BLOCK
const CLAIM = process.env.CLAIM
const SLEEP = process.env.SLEEP

let isConsumerReady = false

async function readPendings() {
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

async function messageProcessing(message) {
    logger.info("------------------------------")
    logger.info("Message is being processed..........")

    logger.info(JSON.stringify(message))


    const mailOptions = {
        from: process.env.RESEND_FROM_ADDRESS,
        reply_to: "support@app-bible.com",
        ...message["message"]
    }

    try {
        const data = await resend.emails.send(mailOptions)

        logger.info(`Mail sent ID: ${data.data ? data.data.id : null}`, )
        logger.info(`Sending result: ${JSON.stringify(data)}`, )
    } catch(error) {
        logger.error("Error during Verification Email Sending")
        logger.error("", {stack: error.stack})

        throw error        
    }

    await redisClientMAILER.XACKDEL(
        streamName,
        groupName,
        message["id"],
        "KEEPREF"
    )

    logger.info("Message processed successfuly!")

    logger.info("------------------------------")
}

const healthServer = http.createServer(async (req, res) => {
    logger.info(req.url)

    if (req.url === "/ready") {
        if (isConsumerReady) {
            res.writeHead(200)
            
            logger.info("response: /ready -> OK")
            
            return res.end("OK")
        } else {
            res.writeHead(503)

            logger.info("response: /ready -> BAD")

            return res.end("Booting")
        }
    }

    if (req.url === "/health") {
        try {

            const pingPromise = healthRedisClient.ping()

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Redis Ping Timeout Exceeded")), 5000)
            )

            await Promise.race([pingPromise, timeoutPromise])
            
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

healthServer.listen(process.env.APP_PORT, () => {
    isConsumerReady = true

    logger.info(`K8s Health server listening on port ${process.env.APP_PORT}`);
    logger.info(`Consumer ${consumerName} is ready!`)

    readPendings()
})
