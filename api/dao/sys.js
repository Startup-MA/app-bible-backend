import pg from "../utils/pgQueryEngine.js"

async function getAllBibleTextVersions(start_id, number) {
    const result = await pg.query(
        "r",
        `
            SELECT
            id_bible_text_version AS id,
            abb_bible_name AS name,
            full_bible_name AS full_name,
            is_audio_available AS is_audio,
            lang_name,
            languages.id_lang AS lang_id
            FROM bible_text_versions
            LEFT JOIN
            languages
            ON languages.id_lang = bible_text_versions.id_lang
            WHERE id_bible_text_version >= $1
            ORDER BY id_bible_text_version ASC
            LIMIT ${number}
        `,
        [
            start_id
        ]
    )

    return result["rows"]
}

async function getBibleTextVersions(language) {
    const result = await pg.query(
        "r",
        `
            SELECT
            id_bible_text_version AS id,
            abb_bible_name AS name,
            full_bible_name AS full_name,
            is_audio_available AS is_audio,
            lang_name,
            languages.id_lang AS lang_id
            FROM bible_text_versions
            LEFT JOIN
            languages
            ON languages.id_lang = bible_text_versions.id_lang
            WHERE languages.lang_name = $1
        `,
        [
            language
        ]
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
    getBibleTextVersions: getBibleTextVersions,
    getAllLangs: getAllLangs
}