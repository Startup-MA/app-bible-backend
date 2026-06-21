import os from "os"
import dotenv from "dotenv"
import reader from "./reader/reader.js"
import { logger } from "./utils/logger.js"

dotenv.config()

const consumerName = process.env.POD_NAME || os.hostname()

logger.info(`Consumer ${consumerName} is ready!`)

await reader()
