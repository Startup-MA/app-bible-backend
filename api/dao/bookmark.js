import pg from "../utils/pgQueryEngine.js"

async function getUserBookmarksByUserIdAndStartId(id_user, start_id, number) {
    const result = await pg.query(
        `
            SELECT 
            id_bookmark AS id,
            book,
            chapter,
            verses_combination,
            date,
            entity_uuid AS uuid,
            created_at,
            updated_at,
            id_bible_text_version AS bible_id
            FROM bookmarks
            WHERE id_user = $1
            AND id_bookmark >= $2
            ORDER BY id_bookmark ASC
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
    getUserBookmarksByUserIdAndStartId: getUserBookmarksByUserIdAndStartId
}