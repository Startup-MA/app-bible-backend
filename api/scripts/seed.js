import pg from "../utils/pgQueryEngine.js"
import { logger } from "../utils/logger.js"
import dotenv from "dotenv"
import { randomUUID } from "crypto"

dotenv.config()

const LANGUAGES = [
    { name: "Albanian", code: "SQ" },
    { name: "Armenian", code: "HY" },
    { name: "Bosnian", code: "BS" },
    { name: "Bulgarian", code: "BG" },
    { name: "Chinese", code: "ZH" },
    { name: "Croatian", code: "HR" },
    { name: "Estonian", code: "ET" },
    { name: "Finnish", code: "FI" },
    { name: "French", code: "FR" },
    { name: "Georgian", code: "KA" },
    { name: "German", code: "DE" },
    { name: "Greek", code: "EL" },
    { name: "Hindi", code: "HI" },
    { name: "Hungarian", code: "HU" },
    { name: "Indonesian", code: "ID" },
    { name: "Italian", code: "IT" },
    { name: "Korean", code: "KO" },
    { name: "Latvian", code: "LV" },
    { name: "Lithuanian", code: "LT" },
    { name: "Malagasy", code: "MG" },
    { name: "Montenegrin", code: "CNR" },
    { name: "Macedonian", code: "MK" },
    { name: "Norwegian", code: "NO" },
    { name: "Polish", code: "PL" },
    { name: "Portuguese", code: "PT" },
    { name: "Romanian", code: "RO" },
    { name: "Russian", code: "RU" },
    { name: "English", code: "EN" },
    { name: "Serbian", code: "SR" },
    { name: "Slovak", code: "SK" },
    { name: "Slovenian", code: "SL" },
    { name: "Spanish", code: "ES" },
    { name: "Swedish", code: "SV" },
    { name: "Tok Pisin", code: "TPI" },
    { name: "Vietnamese", code: "VI" }
]

const BIBLE_VERSIONS = [
    {bible_code: "KJV", abb_bible_name: "KJV", full_bible_name: "King James Version", is_audio_available: true, id_lang: 28 }
]

async function seedLanguages() {
    logger.warn(`Seeding languages...`)

    for (const lang of LANGUAGES) {
        await pg.query(
            "rw",
            `
                INSERT INTO languages (lang_name, lang_code) 
                VALUES ($1, $2)
                ON CONFLICT (lang_code) DO NOTHING;
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
            "rw",
            `
                INSERT INTO bible_text_versions (bible_code, abb_bible_name, full_bible_name, is_audio_available, id_lang) 
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (bible_code) DO NOTHING;
            `, 
            [
                bible_version.bible_code,
                bible_version.abb_bible_name,
                bible_version.full_bible_name,
                bible_version.is_audio_available,
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
                "rw",
                `
                    INSERT INTO users (email, password, auth_provider, is_admin, entity_uuid) 
                    VALUES ($1, $2, 'email_password', 'true', $3)
                    ON CONFLICT (email) DO NOTHING;
                `, 
                [
                    adminEmails[i],
                    adminPasswordHashes[i],
                    randomUUID()
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