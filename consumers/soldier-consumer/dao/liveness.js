import pg from "../utils/pgQueryEngine.js"

async function health() {
    const result = await pg.query(`SELECT 1`)    

    return result["rows"]
}

export default {
    health: health
}