import pg from "../utils/pgQueryEngine.js"

async function getUserHighlightsByUserId(id_user) {
    const result = await pg.query(
        "r",
        `
            SELECT 
            id_highlight AS id,
            book,
            chapter,
            highlights_json,
            entity_uuid AS uuid,
            created_at,
            updated_at,
            id_bible_text_version AS bible_id
            FROM highlights
            WHERE id_user = $1
        `,
        [
            id_user,
        ]
    )    

    return result["rows"]
}

export default {
    getUserHighlightsByUserId: getUserHighlightsByUserId
}