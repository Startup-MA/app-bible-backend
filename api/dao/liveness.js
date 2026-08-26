import pg from "../utils/pgQueryEngine.js"

async function health_r() {
    const result = await pg.query("r", `SELECT 1`)    

    return result["rows"]
}

async function health_rw() {
    const result = await pg.query("rw", `SELECT 1`)    

    return result["rows"]
}


export default {
    health_r: health_r,
    health_rw: health_rw
}