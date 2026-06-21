import dotenv from "dotenv"
import { logger } from "../utils/logger.js"

dotenv.config()

async function sendEmail(content, mailerClient) {
    const newEmail = await mailerClient.xAdd(process.env.MAILER_STREAM_NAME, '*', content)

    logger.info("Sent Verification Email Status: " + newEmail)
}

export default sendEmail