import os from "os"
import { healthServer } from "./server.js"
import { readPendings } from "./reader/reader.js"
import { logger } from "./logger.js"
import dotenv from "dotenv"

dotenv.config()

const consumerName = process.env.POD_NAME || os.hostname()

healthServer.listen(process.env.APP_PORT, () => {
    logger.info(`K8s Health server listening on port ${process.env.APP_PORT}`);
    logger.info(`Consumer ${consumerName} is ready!`)

    readPendings()
})
