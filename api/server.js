import app from "./app.js"
import dotenv from "dotenv"
import { logger } from "./utils/logger.js"
import { gracefulShutdown } from "./utils/gracefulShutdown.js"

dotenv.config()

const port = process.env.APP_PORT || 3000

export const server = app.listen(port, () => {
    logger.info(`App is listening on port ${port}`)
})

process.on("SIGINT", () => gracefulShutdown("SIGINT"))
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))


