import taskQueue from "../utils/redisQueryEngine.js"
import redisClient from "../connections/redis.js"
import userDAO from "../dao/user.js"
import topicsDAO from "../dao/topics.js"
import versePrayerDAO from "../dao/versePrayer.js"
import customerDAO from "../dao/customer.js"
import bookmarkDAO from "../dao/bookmark.js"
import noteDAO from "../dao/note.js"
import readingHistoryDAO from "../dao/readingHistory.js"
import highlightsDAO from "../dao/highlight.js"
import prayerDAO from "../dao/prayer.js"
import AppError from "../errors/AppError.js"
import ApiGateway from "../outboundAPI/ApiGateway.js"
import { logger } from "../utils/logger.js"
import { clearUserSession } from "../utils/clearUserSession.js"

const { TasksQueue } = redisClient

async function deleteAccount(id_user) {
    const userAppleInfo = await userDAO.verifyUserAppleSub(id_user)

    if (userAppleInfo.length) {
        const result = await ApiGateway.appleAuth.revokeAppleRefreshToken(
            userAppleInfo[0].refresh_token,
            userAppleInfo[0].login_platform
        )
    }

    const customerInfo = await customerDAO.getAllCustomerInfoById(id_user)
    let paddleUserInfo = null

    if (!customerInfo[0].customer_id) {
        paddleUserInfo = await ApiGateway.paddle.getCustomerByEmail(customerInfo[0].email)
    }

    if (customerInfo[0].customer_id || paddleUserInfo.data.length) {
        await ApiGateway.paddle.cancelCustomerActiveSubscriptions(
            customerInfo[0].customer_id ? 
            customerInfo[0].customer_id :
            paddleUserInfo.data[0].id
        )

        await ApiGateway.paddle.archiveCustomerAddresses(
            customerInfo[0].customer_id ?
            customerInfo[0].customer_id :
            paddleUserInfo.data[0].id
        )

        await ApiGateway.paddle.archiveCustomer(
            customerInfo[0].customer_id ?
            customerInfo[0].customer_id :
            paddleUserInfo.data[0].id,
            customerInfo[0].entity_uuid
        )
    }

    await clearUserSession(id_user)

    await userDAO.deleteAllUserData(id_user, customerInfo[0].email)

    return {
        message: "User account successfully deleted"
    }
}

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

async function createOrUpdateUserTopics(id_user, userTopics) {
    const customerInfo = await customerDAO.getAllCustomerInfoById(id_user)

    if (!((customerInfo[0].subscription_tier === "Advanced" &&
        customerInfo[0].subscription_status === "active") || 
        (customerInfo[0].subscription_tier === "Premium" &&
        customerInfo[0].subscription_status === "active") || 
        (customerInfo[0].subscription_tier === "Premium" &&
        customerInfo[0].subscription_status === "trialing"))) {

        throw AppError.conflict("Not allowed to access. User doesn't have enough rights or an active subscription.")
    }

    await taskQueue.publish(
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "createOrUpdateUserTopics",
            id_user: String(id_user),
            userTopics: JSON.stringify(userTopics)
        }  
    ).catch(err => {
        logger.error("[Redis taskQueue] Error updating users topics")
        throw err
    })
}

async function getUserTopics(id_user) {
    const customerInfo = await customerDAO.getAllCustomerInfoById(id_user)

    if (!((customerInfo[0].subscription_tier === "Advanced" &&
        customerInfo[0].subscription_status === "active") || 
        (customerInfo[0].subscription_tier === "Premium" &&
        customerInfo[0].subscription_status === "active") || 
        (customerInfo[0].subscription_tier === "Premium" &&
        customerInfo[0].subscription_status === "trialing"))) {

        throw AppError.conflict("Not allowed to access. User doesn't have enough rights or an active subscription.")
    }

    const userTopics = await topicsDAO.getUserTopics(id_user)

    return {
        data: userTopics 
    }
}

async function generateDailyVersePrayer(id_user, userLanguage) {
    const customerInfo = await customerDAO.getAllCustomerInfoById(id_user)

    if (!((customerInfo[0].subscription_tier === "Advanced" &&
        customerInfo[0].subscription_status === "active") || 
        (customerInfo[0].subscription_tier === "Premium" &&
        customerInfo[0].subscription_status === "active") || 
        (customerInfo[0].subscription_tier === "Premium" &&
        customerInfo[0].subscription_status === "trialing"))) {

        throw AppError.conflict("Not allowed to access. User doesn't have enough rights or an active subscription.")
    }

    const userTopics = await topicsDAO.getUserTopics(id_user)

    if (!userTopics.length) {
        throw AppError.conflict("Generation is impossible. No active user topics.")
    }
    
    let response = {
        noSuccess: true
    }

    let unsuccessCounter = 0


    while (response.noSuccess) {
        response = await ApiGateway.genAI.generateVerseAndPrayer(userTopics[0]["topics"], userLanguage["language"])
    
        if (response.noSuccess) {
            unsuccessCounter++
        } else {
            break
        }

        if (unsuccessCounter == 3) {
            throw AppError.bad_gateway("Service failed generating user daily content.")
        }
    }

    await taskQueue.publish( 
        TasksQueue,
        process.env.TASKS_STREAM_NAME,
        {
            processingFlowType: "createOrUpdateUserVersePrayer",
            id_user: String(id_user),
            userLanguage: JSON.stringify(userLanguage),
            content: JSON.stringify(response.result)
        }  
    ).catch(err => {
        logger.error("[Redis taskQueue] Error updating user verse and prayer")
        throw err
    })

    return {
        message: "User generated content",
        data: response.result
    }
}

async function getUserDailyVersePrayer(id_user) {
    const customerInfo = await customerDAO.getAllCustomerInfoById(id_user)

    if (!((customerInfo[0].subscription_tier === "Advanced" &&
        customerInfo[0].subscription_status === "active") || 
        (customerInfo[0].subscription_tier === "Premium" &&
        customerInfo[0].subscription_status === "active") || 
        (customerInfo[0].subscription_tier === "Premium" &&
        customerInfo[0].subscription_status === "trialing"))) {

        throw AppError.conflict("Not allowed to access. User doesn't have enough rights or an active subscription.")
    }

    const userVersePrayer = await versePrayerDAO.getDailyVersePrayer(id_user)

    return {
        message: "User verse and prayer",
        data: {
            verse: {
                book: userVersePrayer[0]["book"],
                chapter: userVersePrayer[0]["chapter"],
                verse: userVersePrayer[0]["verse"]
            },
            prayer: {
                title: userVersePrayer[0]["prayer_title"],
                prayer: userVersePrayer[0]["prayer_content"]
            },
            lang_name: userVersePrayer[0]["lang_name"]
        }
    }
}

async function getUserDailyPrayerTranslation(id_user, language) {
    const customerInfo = await customerDAO.getAllCustomerInfoById(id_user)

    if (!((customerInfo[0].subscription_tier === "Advanced" &&
        customerInfo[0].subscription_status === "active") || 
        (customerInfo[0].subscription_tier === "Premium" &&
        customerInfo[0].subscription_status === "active") || 
        (customerInfo[0].subscription_tier === "Premium" &&
        customerInfo[0].subscription_status === "trialing"))) {

        throw AppError.conflict("Not allowed to access. User doesn't have enough rights or an active subscription.")
    }

    const userVersePrayer = await versePrayerDAO.getDailyVersePrayer(id_user)

    if (!userVersePrayer.length) {
        throw AppError.conflict("Translation is impossible. No user daily content.")
    } 
    
    if (userVersePrayer[0]["lang_name"] === language) {
        throw AppError.conflict("Translation into the same language is impossible. Change the language.")
    }

    let response = {
        noSuccess: true
    }

    let unsuccessCounter = 0

    while (response.noSuccess) {
        response = await ApiGateway.genAI.translateUserPrayer(
            {
                prayer: {
                    title: userVersePrayer[0]["prayer_title"],
                    prayer: userVersePrayer[0]["prayer_content"],
                }
            },
            language
        )

        if (response.noSuccess) {
            unsuccessCounter++
        } else {
            break
        }

        if (unsuccessCounter == 3) {
            throw AppError.bad_gateway("Service failed translating user prayer.")
        }
    }

    return {
        message: "User prayer translation",
        data: response.result
    }
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

async function getUserHighlights(book, bible_id, id_user) {
    const userHighlights = await highlightsDAO.getUserHighlightsByUserId(book, bible_id, id_user)
    
    return {
        data: userHighlights
    }
}

async function getUserPrayers(id_user, start_id, number) {
    const userPrayers = await prayerDAO.getUserPrayersByUserIdAndStartId(
        id_user,
        start_id,
        number
    )
    
    return {
        data: userPrayers
    }
}

export default {
    deleteAccount: deleteAccount,
    skipPersonalInfo: skipPersonalInfo,
    getProfile: getProfile,
    updateProfile: updateProfile,
    createOrUpdateUserTopics: createOrUpdateUserTopics,
    getUserTopics: getUserTopics,
    generateDailyVersePrayer: generateDailyVersePrayer,
    getUserDailyVersePrayer: getUserDailyVersePrayer,
    getUserDailyPrayerTranslation: getUserDailyPrayerTranslation,
    sync: sync,
    getUserBookmarks: getUserBookmarks,
    getUserNotes: getUserNotes,
    getUserReadingHistory: getUserReadingHistory,
    getUserHighlights: getUserHighlights,
    getUserPrayers: getUserPrayers
}
