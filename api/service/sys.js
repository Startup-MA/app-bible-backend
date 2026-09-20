import sysDAO from "../dao/sys.js"
import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import { logger } from "../utils/logger.js"
import AppError from "../errors/AppError.js"
import { compareAppVersions } from "../utils/compareAppVersions.js"

const { TasksQueue } = redisClient

async function needToUpdate(os, userVersion) {
    const currentAppVersion = await sysDAO.getCurrentAppVersion()

    if (!currentAppVersion.length) throw AppError.conflict("No app version available")

    const mxavCompRes = compareAppVersions(currentAppVersion[0]["versions"][os].mxav, userVersion)
    
    if (mxavCompRes === -1) throw AppError.conflict("Provided app version is bigger than system mxav version")

    if (mxavCompRes === 0) return { message: "No updates" }

    const mrvCompRes = compareAppVersions(currentAppVersion[0]["versions"][os].mrv, userVersion)

    if (mrvCompRes === -1 || mrvCompRes === 0) return { message: "Update available" }

    return {
        message: "Update required"
    }
}

async function updateAppVersion(versions) {
    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "updateAppVersion",
            versions: JSON.stringify(versions)
        }
    ).catch(err => {
        logger.error("[Redis taskQueue] Error publishing a ticket to the task queue")
        throw err
    })

    return {
        message: "App version sent for update"
    }
}

async function getCurrentAppVersion() {
    const currentAppVersion = await sysDAO.getCurrentAppVersion()

    return {
        message: "Current app version",
        data: currentAppVersion
    }
}

async function getAllBibleTextVersions(start_id, number) {
    const allBibleVersions = await sysDAO.getAllBibleTextVersions(start_id, number)

    return {
        data: allBibleVersions
    }
}

async function getBibleTextVersions(language) {
    const bibleVersions = await sysDAO.getBibleTextVersions(language)

    return {
        data: bibleVersions
    }
}

async function getAllLangs() {
    const languages = await sysDAO.getAllLangs()

    return {
        data: languages
    }
   
}

async function createTicket(ticket) {
    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
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
    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
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
    needToUpdate: needToUpdate, 
    updateAppVersion: updateAppVersion,
    getCurrentAppVersion: getCurrentAppVersion,
    getTicketsPerPage: getTicketsPerPage,
    getTicketsCount: getTicketsCount,
    createTicket: createTicket,
    deleteTickets: deleteTickets,
    getAllBibleTextVersions: getAllBibleTextVersions,
    getBibleTextVersions: getBibleTextVersions,
    getAllLangs: getAllLangs
}