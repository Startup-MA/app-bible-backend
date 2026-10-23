import updateEmail from "../messageProcessingFlow/updateEmail.js"
import setGoogleSub from "../messageProcessingFlow/setGoogleSub.js"
import setAppleSub from "../messageProcessingFlow/setAppleSub.js"
import sendHiddenEmailVerificationCode from "../messageProcessingFlow/sendHiddenEmailVerificationCode.js"
import skipPersonalInfo from "../messageProcessingFlow/skipPersonalInfo.js"
import updateProfile from "../messageProcessingFlow/updateProfile.js"
import createOrUpdateUserTopics from "../messageProcessingFlow/createOrUpdateUserTopics.js"
import createOrUpdateUserVersePrayer from "../messageProcessingFlow/createOrUpdateUserVersePrayer.js"
import sendResetPasswordLink from "../messageProcessingFlow/sendResetPasswordLink.js"
import createNewPassword from "../messageProcessingFlow/createNewPassword.js"
import addNewCustomer from "../messageProcessingFlow/addNewCustomer.js"
import updateCustomer from "../messageProcessingFlow/updateCustomer.js"
import upsertGoogleSubscription from "../messageProcessingFlow/upsertGoogleSubscription.js"
import registerNewUser from "../messageProcessingFlow/registerNewUser.js"
import sendNewVerificationCode from "../messageProcessingFlow/sendNewVerificationCode.js"
import deleteUserVerificationCode from "../messageProcessingFlow/deleteUserVerificationCode.js"
import createTicket from "../messageProcessingFlow/createTicket.js"
import deleteTickets from "../messageProcessingFlow/deleteTickets.js"
import syncBookmarks from "../messageProcessingFlow/syncBookmarks.js"
import syncNotes from "../messageProcessingFlow/syncNotes.js"
import syncUserReadingHistory from "../messageProcessingFlow/syncUserReadingHistory.js"
import syncHighlights from "../messageProcessingFlow/syncHighlights.js"
import syncPrayers from "../messageProcessingFlow/syncPrayers.js"
import updateAppVersion from "../messageProcessingFlow/updateAppVersion.js"

import redisClient from "../connections/redis.js"
import dotenv from "dotenv"

import { logger } from "../utils/logger.js"

dotenv.config()

const { TasksQueue } = redisClient

const streamName = process.env.TASKS_STREAM_NAME
const groupName = process.env.GROUP_NAME

async function messageHandler(message) {
    const start = Date.now()

    switch(message["message"]["processingFlowType"]) {
        case "updateAppVersion":
            await updateAppVersion(message)
            break
        case "updateEmail":
            await updateEmail(message)
            break
        case "setAppleSub":
            await setAppleSub(message)
            break
        case "sendHiddenEmailVerificationCode":
            await sendHiddenEmailVerificationCode(message)
            break
        case "setGoogleSub":
            await setGoogleSub(message)
            break
        case "skipPersonalInfo":
            await skipPersonalInfo(message)
            break
        case "updateProfile":
            await updateProfile(message)
            break
        case "createOrUpdateUserTopics":
            await createOrUpdateUserTopics(message)
            break
        case "createOrUpdateUserVersePrayer":
            await createOrUpdateUserVersePrayer(message)
            break
        case "registerNewUser":
            await registerNewUser(message)
            break
        case "sendNewVerificationCode":
            await sendNewVerificationCode(message)
            break
        case "deleteUserVerificationCode":
            await deleteUserVerificationCode(message)
            break
        case "sendResetPasswordLink":
            await sendResetPasswordLink(message)
            break
        case "createNewPassword":
            await createNewPassword(message)
            break
        case "addNewCustomer":
            await addNewCustomer(message)
            break
        case "updateCustomer":
            await updateCustomer(message)
            break
        case "upsertGoogleSubscription":
            await upsertGoogleSubscription(message)
            break
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
        case "syncPrayers":
            await syncPrayers(message)
            break
        default:
            logger.warn("No such flow!")
    }

    await TasksQueue.XACKDEL(
        streamName,
        groupName,
        message["id"],
        "KEEPREF"
    )

    const end = Date.now()

    logger.info(
        `
            ----------------------------------------------------------------------------------
                Success | id: ${message.id} | flow type: ${message.message.processingFlowType} | time: ${end - start}ms
            ----------------------------------------------------------------------------------
        `
    )
}

export default messageHandler