import createTicket from "../messageProcessingFlow/createTicket.js"
import deleteTickets from "../messageProcessingFlow/deleteTickets.js"
import syncBookmarks from "../messageProcessingFlow/syncBookmarks.js"
import syncNotes from "../messageProcessingFlow/syncNotes.js"
import syncUserReadingHistory from "../messageProcessingFlow/syncUserReadingHistory.js"
import syncHighlights from "../messageProcessingFlow/syncHighlights.js"
import syncPraylist from "../messageProcessingFlow/syncPraylist.js"

import redisClient from "../connections/redis.js"
import dotenv from "dotenv"

import { logger } from "../utils/logger.js"

dotenv.config()

const { Rome } = redisClient

const streamName = process.env.STREAM_NAME
const groupName = process.env.GROUP_NAME

async function messageHandler(message) {
    logger.info("------------------------------")
    logger.info("Message is being processed..........")

    logger.info(JSON.stringify(message))

    switch(message["message"]["processingFlowType"]) {
        case "createTicket":
            await createTicket(message)
            break
        case "deleteTickets":
            await deleteTickets(message)
            break
        case "syncBookmarks":
            await syncBookmarks(message)
            break
        case "syncNotes":
            await syncNotes(message)
            break
        case "syncUserReadingHistory":
            await syncUserReadingHistory(message)
            break
        case "syncHighlights":
            await syncHighlights(message)
            break
        case "syncPraylist":
            await syncPraylist(message)
            break
        default:
            logger.warn("No such flow!")
    }

    await Rome.XACKDEL(
        streamName,
        groupName,
        message["id"],
        "KEEPREF"
    )

    logger.info("Message processed successfuly!")

    logger.info("------------------------------")
}

export default messageHandler