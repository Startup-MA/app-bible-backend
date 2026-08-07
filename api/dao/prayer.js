import pg from "../utils/pgQueryEngine.js"

async function getUserPrayersByUserIdAndStartId(id_user, start_id, number) {
    const result = await pg.query(
        `
            SELECT 
            id_prayer AS id,
            prayer_title AS title,
            prayer_content AS content,
            entity_uuid AS uuid,
            created_at,
            updated_at
            FROM prayers
            WHERE id_user = $1
            AND id_prayer >= $2
            ORDER BY id_prayer ASC
            LIMIT ${number}
        `,
        [
            id_user,
            start_id
        ]
    )    

    return result["rows"]
}

export default {
    getUserPrayersByUserIdAndStartId: getUserPrayersByUserIdAndStartId
}