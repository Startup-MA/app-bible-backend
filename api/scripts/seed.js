import pg from "../utils/pgQueryEngine.js"
import { logger } from "../utils/logger.js"
import dotenv from "dotenv"

dotenv.config()

const LANGUAGES = [
    { name: "Albanian", code: "AL" },
    { name: "Armenian", code: "AM" },
    { name: "Bosnian", code: "BA" },
    { name: "Bulgarian", code: "BG" },
    { name: "Chinese", code: "CN" },
    { name: "Croatian", code: "HR" },
    { name: "Estonian", code: "EE" },
    { name: "Finnish", code: "FI" },
    { name: "French", code: "FR" },
    { name: "Georgian", code: "GE" },
    { name: "German", code: "DE" },
    { name: "Greek", code: "GR" },
    { name: "Hindi", code: "IN" },
    { name: "Hungarian", code: "HU" },
    { name: "Indonesian", code: "ID" },
    { name: "Italian", code: "IT" },
    { name: "Korean", code: "KR" },
    { name: "Latvian", code: "LV" },
    { name: "Lithuanian", code: "LT" },
    { name: "Malagasy", code: "MG" },
    { name: "Montenegrin", code: "ME" },
    { name: "Macedonian", code: "MK" },
    { name: "Norwegian", code: "NO" },
    { name: "Polish", code: "PL" },
    { name: "Portuguese", code: "PT" },
    { name: "Romanian", code: "RO" },
    { name: "Russian", code: "RU" },
    { name: "English", code: "EN" },
    { name: "Serbian", code: "RS" },
    { name: "Slovak", code: "SK" },
    { name: "Slovenian", code: "SI" },
    { name: "Spanish", code: "ES" },
    { name: "Swedish", code: "SE" },
    { name: "Tok Pisin", code: "PG" },
    { name: "Vietnamese", code: "VN" }
]

const BIBLE_VERSIONS = [
    {abb_bible_name: "KJV", full_bible_name: "King James Version", is_audio_availbale: true, download_link: "https://some-link.com", id_lang: 28 }
]

async function seedLanguages() {
    logger.warn(`Seeding languages...`)

    for (const lang of LANGUAGES) {
        await pg.query(
            `
                INSERT INTO languages (lang_name, country_code) 
                VALUES ($1, $2)
                ON CONFLICT (country_code) DO NOTHING;
            `, 
            [
                lang.name,
                lang.code
            ]
        )
    }

    logger.info(`All languages seeded successfully.`)
}

async function seedBibleVersions() {
    logger.warn(`Seeding bible versions...`)

    for (const bible_version of BIBLE_VERSIONS ) {
        await pg.query(
            `
                INSERT INTO bible_text_versions (abb_bible_name, full_bible_name, is_audio_available, download_link, id_lang) 
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (full_bible_name) DO NOTHING;
            `, 
            [
                bible_version.abb_bible_name,
                bible_version.full_bible_name,
                bible_version.is_audio_availbale,
                bible_version.download_link,
                bible_version.id_lang
            ]
        )
    }

    logger.info(`All bible versions seeded successfully.`)
}

async function seedAdmins() {
    const adminEmails = process.env.ADMIN_EMAILS.split(",")
    const adminPasswordHashes = process.env.ADMIN_PASSWORDS_HASHES.split(",")

    if (adminEmails && adminPasswordHashes) {
        for (let i = 0; i < adminEmails.length; i++) {
            logger.warn(`Seeding admin user: ${adminEmails[i]}...`)
        
            await pg.query(
                `
                    INSERT INTO users (email, password, is_admin) 
                    VALUES ($1, $2, 'true')
                    ON CONFLICT (email) DO NOTHING;
                `, 
                [
                    adminEmails[i],
                    adminPasswordHashes[i]
                ]
            )

            logger.info(`Admin [${i}] seeded successfully.`)
        }
    }
}


async function runSeed() {
    try {
        await seedLanguages()
        await seedAdmins()
        await seedBibleVersions()

        logger.info("All seeds completed successfully.")
    } catch (error) {
        logger.error("Seeding failed: ")
        logger.error("", {stack: error.stack})
    }
}

runSeed()