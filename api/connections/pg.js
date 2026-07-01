import { Pool } from "pg"
import { logger } from "../utils/logger.js"

const pool = new Pool(
    {
        database: process.env.PGDATABASE,
        host: process.env.PGHOST,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
        max: process.env.MAX,
        connectionTimeoutMillis: process.env.CONNECTION_TIMEOUT_MILLIS,
        idleTimeoutMillis: process.env.IDLE_TIMEOUT_MILLIS
    }
)

export default pool