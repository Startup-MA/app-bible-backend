import userService from "../service/user.js"
import { StatusCodes } from "http-status-codes"
import { logger } from "../utils/logger.js"
import AppError from "../errors/AppError.js"
import { create } from "domain"

async function skipPersonalInfo(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Setting skipped profile info modal for user: ${id} device: ${device}`)

    await userService.skipPersonalInfo(id)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: "Modal successfully skipped"
    })
}

async function updateProfile(req, res, next) {
    const updatedProfileData = req.body 

    const { id, device } = req.session.user

    logger.info(`Updating profile info for user: ${id} device: ${device}`)

    await userService.updateProfile(id, updatedProfileData)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: "New profile data is accepted for update"
    })
}

async function createOrUpdateUserTopics(req, res, next) {
    const userTopics = req.body

    const { id, device } = req.session.user

    logger.info(`Creating or Updating topics for user: ${id} device: ${device}`)

    await userService.createOrUpdateUserTopics(id, userTopics)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: "Topics are accepted for update"
    })
}

async function getUserTopics(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Retrieving topics for user: ${id} device: ${device}`)

    const result = await userService.getUserTopics(id)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: "User topics",
        data: result.data
    })
}

async function generateDailyVersePrayer(req, res, next) {
    const userLanguage = req.body

    const { id, device } = req.session.user

    logger.info(`Preparing verse and prayer for user: ${id} device: ${device}`)

    const result = await userService.generateDailyVersePrayer(id, userLanguage)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message,
        data: result.data
    })
}

async function getUserDailyVersePrayer(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Retrieving verse and prayer for user: ${id} device: ${device}`)

    const result = await userService.getUserDailyVersePrayer(id)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message,
        data: result.data
    })
}

async function getUserDailyPrayerTranslation(req, res, next) {
    const userLanguage = req.body

    const { id, device } = req.session.user

    logger.info(`Preparing prayer translation for user: ${id} device: ${device}`)

    const result = await userService.getUserDailyPrayerTranslation(id, userLanguage["language"])

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: result.message,
        data: result.data
    })
}

async function syncBookmarks(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Syncing bookmarks for user: ${id} device: ${device}`)
    
    await userService.sync({
        processingFlowType: "syncBookmarks",
        bookmarks: JSON.stringify(req.body),
        id_user: String(id)
    })

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: "Bookmarks are accepted for sync"
    })
}

async function syncNotes(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Syncing notes for user: ${id} device: ${device}`)
    
    await userService.sync({
        processingFlowType: "syncNotes",
        notes: JSON.stringify(req.body),
        id_user: String(id)
    })

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: "Notes are accepted for sync"
    })
}

async function syncUserReadingHistory(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Syncing reading history for user: ${id} device: ${device}`)
    
    if (req.body.created) {
        const result = await userService.getUserReadingHistory(id)

        if (result.data.length) {
            throw AppError.not_acceptable("Only one reading history object for the user is allowed!")
        }
    }

    await userService.sync({
        processingFlowType: "syncUserReadingHistory",
        readingHistory: JSON.stringify(req.body),
        id_user: String(id)
    })

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: "User Reading History is accepted for sync"
    })
}

async function syncHighlights(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Syncing highlights for user: ${id} device: ${device}`)

    await userService.sync({
        processingFlowType: "syncHighlights",
        highlights: JSON.stringify(req.body),
        id_user: String(id)
    })

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: "Highlights are accepted for sync"
    })
}

async function syncPrayers(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Syncing prayers for user: ${id} device: ${device}`)
    
    await userService.sync({
        processingFlowType: "syncPrayers",
        prayers: JSON.stringify(req.body),
        id_user: String(id)
    })

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: "Prayers are accepted for sync"
    })
}

async function getUserBookmarks(req, res, next) {
    const { id, device } = req.session.user
    const { start_id, number } = req.body

    logger.info(`Retrieving bookmarks for user: ${id} device: ${device}`)
    
    const result = await userService.getUserBookmarks(
        id,
        start_id, 
        number
    )

    return res.status(StatusCodes.OK).json({
        status: "success",
        data: {
            bookmarks: result.data
        }
    })
}

async function getUserNotes(req, res, next) {
    const { id, device } = req.session.user
    const { start_id, number } = req.body
    
    logger.info(`Retrieving notes for user: ${id} device: ${device}`)
    
    const result = await userService.getUserNotes(
        id,
        start_id,
        number
    )

    return res.status(StatusCodes.OK).json({
        status: "success",
        data: {
            notes: result.data
        }
    })
}

async function getUserReadingHistory(req, res, next) {
    const { id, device } = req.session.user
    
    logger.info(`Retrieving reading history for user: ${id} device: ${device}`)
    
    const result = await userService.getUserReadingHistory(
        id,
    )

    return res.status(StatusCodes.OK).json({
        status: "success",
        data: {
            reading_history: result.data
        }
    })
}

async function getUserHighlights(req, res, next) {
    const { id, device } = req.session.user
    
    logger.info(`Retrieving highlights for user: ${id} device: ${device}`)
    
    const result = await userService.getUserHighlights(
        id
    )

    return res.status(StatusCodes.OK).json({
        status: "success",
        data: {
            highlights: result.data
        }
    })
}

async function getUserPrayers(req, res, next) {
    const { id, device } = req.session.user
    const { start_id, number } = req.body
    
    logger.info(`Retrieving prayers for user: ${id} device: ${device}`)
    
    const result = await userService.getUserPrayers(
        id,
        start_id,
        number
    )

    return res.status(StatusCodes.OK).json({
        status: "success",
        data: {
            prayers: result.data
        }
    })
}

export default {
    skipPersonalInfo: skipPersonalInfo,
    updateProfile: updateProfile,
    createOrUpdateUserTopics: createOrUpdateUserTopics,
    getUserTopics: getUserTopics,
    generateDailyVersePrayer: generateDailyVersePrayer,
    getUserDailyVersePrayer: getUserDailyVersePrayer,
    getUserDailyPrayerTranslation: getUserDailyPrayerTranslation,
    syncBookmarks: syncBookmarks,
    syncNotes: syncNotes,
    syncUserReadingHistory: syncUserReadingHistory,
    syncHighlights: syncHighlights,
    syncPrayers: syncPrayers,
    getUserBookmarks: getUserBookmarks,
    getUserNotes: getUserNotes,
    getUserReadingHistory: getUserReadingHistory,
    getUserHighlights: getUserHighlights,
    getUserPrayers: getUserPrayers
}