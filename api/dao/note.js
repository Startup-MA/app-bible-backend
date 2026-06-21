import pg from "../utils/pgQueryEngine.js"

async function getUserNotesByUserIdAndStartId(id_user, start_id, number) {
    const result = await pg.query(
        `
            SELECT 
            id_note AS id,
            book,
            chapter,
            verses_combination,
            content,
            date,
            entity_uuid AS uuid,
            created_at,
            updated_at,
            id_bible_text_version AS bible_id
            FROM notes
            WHERE id_user = $1
            AND id_note >= $2
            ORDER BY id_note ASC
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
    getUserNotesByUserIdAndStartId: getUserNotesByUserIdAndStartId
}