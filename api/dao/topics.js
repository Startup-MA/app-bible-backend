import pg from "../utils/pgQueryEngine.js"

async function getUserTopics(id_user) {
    const result = await pg.query(
        "r",
        `
            SELECT 
            topics
            FROM users_topics
            WHERE id_user = $1
        `,
        [
            id_user
        ]
    )    

    return result["rows"]
}

export default {
    getUserTopics: getUserTopics
}