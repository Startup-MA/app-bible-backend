import pg from "../utils/pgQueryEngine.js"

async function getUserReadingHistoryByUserIdAndStartId(id_user) {
    const result = await pg.query(
        "r",
        `
            SELECT
            id_user_reading_history AS id,
            user_reading_history_json AS history_json,
            entity_uuid AS uuid,
            created_at AS created_at,
            updated_at AS updated_at
            FROM users_reading_history
            WHERE id_user = $1
        `,
        [
            id_user,
        ]
    )    

    return result["rows"]
}

export default {
    getUserReadingHistoryByUserIdAndStartId: getUserReadingHistoryByUserIdAndStartId
}