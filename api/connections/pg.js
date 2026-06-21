import { Pool } from "pg"

const pool = new Pool(
    {
        database: process.env.DATABASE,
        host: process.env.HOST,
        password: process.env.PASSWORD,
        port: process.env.PORT,
        user: process.env.USER,
        max: process.env.MAX,
        connectionTimeoutMillis: process.env.CONNECTION_TIMEOUT_MILLIS,
        idleTimeoutMillis: process.env.IDLE_TIMEOUT_MILLIS
    }
)

export default pool