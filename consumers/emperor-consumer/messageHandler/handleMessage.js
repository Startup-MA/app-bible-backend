import skipPersonalInfo from "../messageProcessingFlow/skipPersonalInfo.js"
import updateProfile from "../messageProcessingFlow/updateProfile.js"
import sendResetPasswordLink from "../messageProcessingFlow/sendResetPasswordLink.js"
import createNewPassword from "../messageProcessingFlow/createNewPassword.js"
import addNewClient from "../messageProcessingFlow/addNewClient.js"
import registerNewUser from "../messageProcessingFlow/registerNewUser.js"
import sendNewVerificationCode from "../messageProcessingFlow/sendNewVerificationCode.js"
import deleteUserVerificationCode from "../messageProcessingFlow/deleteUserVerificationCode.js"
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
        case "skipPersonalInfo":
            await skipPersonalInfo(message)
            break
        case "updateProfile":
            await updateProfile(message)
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
        case "addNewClient":
            await addNewClient(message)
            break
        default:
            logger.warn("Now such flow!")
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