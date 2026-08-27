import { Pool } from "pg"
import { logger } from "../utils/logger.js"

const pool = new Pool(
    {
        database: process.env.PGDATABASE,
        host: process.env.PGHOST + (process.env.NODE_ENV !== "development" ? "-ro" : ""),
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
        max: process.env.MAX,
        connectionTimeoutMillis: process.env.CONNECTION_TIMEOUT_MILLIS,
        idleTimeoutMillis: process.env.IDLE_TIMEOUT_MILLIS
    }
)

pool.on("error", (err, client) => {
    logger.error("Unexpected error on idle database client (r)")
    logger.error("", {stack: err.stack})
})

export default pool