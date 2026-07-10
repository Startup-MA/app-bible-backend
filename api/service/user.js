import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import userDAO from "../dao/user.js"
import bookmarkDAO from "../dao/bookmark.js"
import noteDAO from "../dao/note.js"
import readingHistoryDAO from "../dao/readingHistory.js"
import highlightsDAO from "../dao/highlight.js"
import praylistDAO from "../dao/praylist.js"
import { logger } from "../utils/logger.js"

const { TasksQueue } = redisClient

async function getProfile(id_user) {
    const userProfile = await userDAO.findUserById(id_user)
    
    return {
        data: userProfile
    }
}

async function skipPersonalInfo(id_user) {
    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "skipPersonalInfo",
            id_user: String(id_user)
        }
    ).catch(err => {
        logger.error("[Redis taskQueue] Error skipping profile info")
        throw err
    })
}

async function updateProfile(id_user, updatedProfileData) {
    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "updateProfile",
            id_user: String(id_user),
            updatedProfileData: JSON.stringify(updatedProfileData)
        }  
    ).catch(err => {
        logger.error("[Redis taskQueue] Error updating profile data")
        throw err
    })
}

async function sync(data) {
    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        data
    ).catch(err => {
        logger.error("[Redis taskQueue] Error synchronizing data")
        throw err
    })
}

async function getUserBookmarks(id_user, start_id, number) {
    const userBookmarks = await bookmarkDAO.getUserBookmarksByUserIdAndStartId(
        id_user,
        start_id,
        number
    )

    return {
        data: userBookmarks
    }
}

async function getUserNotes(id_user, start_id, number) {
    const userNotes = await noteDAO.getUserNotesByUserIdAndStartId(
        id_user,
        start_id,
        number
    )
    
    return {
        data: userNotes
    }
}

async function getUserReadingHistory(id_user) {
    const userReadingHistory = await readingHistoryDAO.getUserReadingHistoryByUserIdAndStartId(
        id_user,
    )

    return {
        data: userReadingHistory
    }
}

async function getUserHighlights(id_user) {
    const userHighlights = await highlightsDAO.getUserHighlightsByUserId(
        id_user
    )
    
    return {
        data: userHighlights
    }
}

async function getUserPraylist(id_user, start_id, number) {
    const userPraylist = await praylistDAO.getUserPraylistByUserIdAndStartId(
        id_user,
        start_id,
        number
    )
    
    return {
        data: userPraylist
    }
}

export default {
    skipPersonalInfo: skipPersonalInfo,
    getProfile: getProfile,
    updateProfile: updateProfile,
    sync: sync,
    getUserBookmarks: getUserBookmarks,
    getUserNotes: getUserNotes,
    getUserReadingHistory: getUserReadingHistory,
    getUserHighlights: getUserHighlights,
    getUserPraylist: getUserPraylist
}
