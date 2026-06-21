import sysDAO from "../dao/sys.js"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import { logger } from "../utils/logger.js"

const { Rome } = redisClient

async function getAllBibleTextVersions() {
    const allBibleVersions = await sysDAO.getAllBibleTextVersions()

    return {
        data: allBibleVersions
    }
}

async function getAllLangs() {
    const languages = await sysDAO.getAllLangs()

    return {
        data: languages
    }
   
}

async function createTicket(ticket) {
    taskQueue.publish(
        Rome,
        process.env.ROME_STREAM_REGULAR_NAME,
        {
            processingFlowType: "createTicket",
            ticket: JSON.stringify(ticket)
        }
    ).catch(err => {
        logger.error("[Redis taskQueue] Error publishing a ticket to the task queue")
        throw err
    })
}

async function deleteTickets(from, to) {
    taskQueue.publish(
        Rome,
        process.env.ROME_STREAM_REGULAR_NAME,
        {
            processingFlowType: "deleteTickets",
            from: String(from),
            to: String(to)
        }
    ).catch(err => {
        logger.error("[Redis taskQueue] Error publishing a tickets deletion task to the task queue")
        throw err
    })
}

async function getTicketsPerPage(page) {
    const ticketsPerPage = await sysDAO.getTicketsPerPage(page)
    
    return {
        data: ticketsPerPage
    }
}   

async function getTicketsCount() {
    const ticketsCount = await sysDAO.getTicketsCount()
    
    return {
        data: ticketsCount
    }
}   

export default {
    getTicketsPerPage: getTicketsPerPage,
    getTicketsCount: getTicketsCount,
    createTicket: createTicket,
    deleteTickets: deleteTickets,
    getAllBibleTextVersions: getAllBibleTextVersions,
    getAllLangs: getAllLangs
}