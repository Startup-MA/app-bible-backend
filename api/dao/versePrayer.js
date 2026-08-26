import pg from "../utils/pgQueryEngine.js"

async function getDailyVersePrayer(id_user) {
    const result = await pg.query(
        "r",
        `
            SELECT
            book,
            chapter,
            verse,
            prayer_title,
            prayer_content,
            lang_name
            FROM daily_verses
            LEFT JOIN daily_prayers
            ON daily_verses.id_user = daily_prayers.id_user
            LEFT JOIN languages
            ON daily_prayers.id_lang = languages.id_lang
            WHERE daily_verses.id_user = $1
        `,
        [
            id_user
        ]
    )    

    return result["rows"]
}

export default {
    getDailyVersePrayer: getDailyVersePrayer
}