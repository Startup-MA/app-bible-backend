import pg from "../utils/pgQueryEngine.js"

async function getUserPraylistByUserIdAndStartId(id_user, start_id, number) {
    const result = await pg.query(
        `
            SELECT 
            id_pray AS id,
            pray_title AS title,
            pray_content AS content,
            entity_uuid AS uuid,
            created_at,
            updated_at
            FROM pray_list
            WHERE id_user = $1
            AND id_pray >= $2
            ORDER BY id_pray ASC
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
    getUserPraylistByUserIdAndStartId: getUserPraylistByUserIdAndStartId
}