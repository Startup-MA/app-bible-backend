import os from "os"
import dotenv from "dotenv"
import reader from "./reader/reader.js"
import { logger } from "./utils/logger.js"
import { healthServer } from "./server.js";

dotenv.config()

const consumerName = process.env.POD_NAME || os.hostname()

healthServer.listen(process.env.APP_PORT, () => {
    logger.info(`K8s Health server listening on port ${process.env.APP_PORT}`);
    logger.info(`Consumer ${consumerName} is ready!`)

   reader()
})