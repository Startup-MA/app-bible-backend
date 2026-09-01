import pg from "../utils/pgQueryEngine.js"

async function getUserHighlightsByUserId(book, bible_id, id_user) {
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
            WHERE book = $1
            AND id_bible_text_version = $2
            AND id_user = $3
            ORDER BY chapter ASC
        `,
        [
            book,
            bible_id,
            id_user
        ]
    )    

    return result["rows"]
}

export default {
    getUserHighlightsByUserId: getUserHighlightsByUserId
}