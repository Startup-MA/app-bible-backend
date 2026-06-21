import sysService from "../service/sys.js"
import { StatusCodes } from "http-status-codes"
import { logger } from "../utils/logger.js"

async function getAllBibleTextVersions(req, res, next) {
    logger.info("Extracting all bible text versions")

    const allBibleVersions = await sysService.getAllBibleTextVersions()

    return res.status(StatusCodes.OK).json({
        status: "success",
        data: allBibleVersions.data
    })
}

async function getAllLangs(req, res, next) {
    logger.info("Extracting all languages from the system")

    const allLangs = await sysService.getAllLangs()
    
    return res.status(StatusCodes.OK).json({
        status: "success",
        data: allLangs.data
    })
}

async function createTicket(req, res, next) {
    const ticket = req.body
    
    logger.info("A ticket from user has arrived!")

    await sysService.createTicket(ticket)
    
    return res.status(StatusCodes.OK).json({
        status: "success",
        data: "Ticket accepted"
    })
}

async function deleteTickets(req, res, next) {
    const { id, device, is_admin } = req.session.user
    const { from, to } = req.body

    logger.info(`Deleting tickets from: ${from} to:${to} user: ${id} device: ${device} isAdmin: ${is_admin}`)

    await sysService.deleteTickets(from, to)
    
    return res.status(StatusCodes.OK).json({
        status: "success",
        data: "Tickets are accepted for deletion"
    })
}

async function getTicketsPerPage(req, res, next) {
    const { id, device, is_admin } = req.session.user
    const { page } = req.params

    logger.info(`Retrieving tickets for page: ${page} user: ${id} device: ${device} isAdmin: ${is_admin}`)

    const ticketsPerPage = await sysService.getTicketsPerPage(page)
    
    return res.status(StatusCodes.OK).json({
        status: "success",
        message: `Tickets per page: ${page}`,
        data: ticketsPerPage.data
    })
}   

async function getTicketsCount(req, res, next) {
    const { id, device, is_admin } = req.session.user

    logger.info(`Getting tickets count for user: ${id} device: ${device} isAdmin: ${is_admin}`)

    const ticketsCount = await sysService.getTicketsCount()
    
    return res.status(StatusCodes.OK).json({
        status: "success",
        message: `Tickets count`,
        data: ticketsCount.data
    })
}

export default {
    getTicketsPerPage: getTicketsPerPage,
    getTicketsCount: getTicketsCount,
    createTicket: createTicket,
    deleteTickets: deleteTickets,
    getAllBibleTextVersions: getAllBibleTextVersions,
    getAllLangs: getAllLangs
}