import { Pool } from "pg"

const pool = new Pool(
    {
        "database": process.env.PG_DATABASE,
        "host": process.env.PG_HOST,
        "password": process.env.PG_PASSWORD,
        "port": process.env.PG_PORT,
        "user": process.env.PG_USER,
        "max": process.env.MAX,
        "connectionTimeoutMillis": process.env.CONNECTION_TIMEOUT_MILLIS,
        "idleTimeoutMillis": process.env.IDLE_TIMEOUT_MILLIS
    }
)

export default pool