import pg from "../utils/pgQueryEngine.js"

async function getAllBibleTextVersions() {
    const result = await pg.query(
        "r",
        `
            SELECT
            id_bible_text_version AS id,
            abb_bible_name AS name,
            full_bible_name AS full_name,
            is_audio_available AS is_audio,
            download_link AS link,
            id_lang AS lang_id
            FROM bible_text_versions
        `
    )

    return result["rows"]
}

async function getAllLangs() {
    const result = await pg.query(
        "r",
        `
            SELECT
            id_lang AS id,
            lang_name,
            country_code
            FROM languages
        `
    )

    return result["rows"]
}

async function getTicketsPerPage(page) {
    const result = await pg.query(
        "r",
        `
            SELECT 
            id_ticket AS id,
            subject,
            name,
            email,
            timestamp,
            message
            FROM users_tickets 
            ORDER BY id_ticket ASC 
            LIMIT 100 OFFSET $1
        `,
        [
            (page - 1) * 100
        ]
    )

    return result["rows"]
}

async function getTicketsCount() {
        const result = await pg.query(
        `
            SELECT count(*) FROM users_tickets
        `
    )

    return result["rows"]
}

export default {
    getTicketsPerPage: getTicketsPerPage,
    getTicketsCount: getTicketsCount,
    getAllBibleTextVersions: getAllBibleTextVersions,
    getAllLangs: getAllLangs
}