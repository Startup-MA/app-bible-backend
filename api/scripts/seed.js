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
    { bible_code: "bibla", abb_bible_name: "Bibla", full_bible_name: "Bibla e Shenjtë", lang_code: "SQ" },
    { bible_code: "hyw", abb_bible_name: "W. Armenian", full_bible_name: "Western Armenian Bible", lang_code: "HY" },
    { bible_code: "bbg", abb_bible_name: "Българска", full_bible_name: "Българска Библия", lang_code: "BG" },
    { bible_code: "cuvt", abb_bible_name: "CUVT", full_bible_name: "Chinese Union Version (Traditional)", lang_code: "ZH" },
    { bible_code: "cuvs", abb_bible_name: "CUVS", full_bible_name: "Chinese Union Version (Simplified)", lang_code: "ZH" },
    { bible_code: "sigaot", abb_bible_name: "思高繁", full_bible_name: "思高繁體聖經", lang_code: "ZH" },
    { bible_code: "sigaos", abb_bible_name: "思高简", full_bible_name: "思高聖經", lang_code: "ZH" },
    { bible_code: "pinyin", abb_bible_name: "Pinyin", full_bible_name: "Chinese Pinyin Bible", lang_code: "ZH" },
    { bible_code: "pinyuhan", abb_bible_name: "拼音汉字", full_bible_name: "Chinese Pinyin and Characters", lang_code: "ZH" },
    { bible_code: "saric", abb_bible_name: "Šarić", full_bible_name: "Ivan Šarić", lang_code: "HR" },
    { bible_code: "eepiibel", abb_bible_name: "EP1997", full_bible_name: "Eestikeelne Piibel 1997", lang_code: "ET" },
    { bible_code: "raamattu", abb_bible_name: "Raamattu", full_bible_name: "Raamattu", lang_code: "FI" },
    { bible_code: "lsg", abb_bible_name: "LSG", full_bible_name: "Louis Segond 1910", lang_code: "FR" },
    { bible_code: "luther", abb_bible_name: "LUT1912", full_bible_name: "Luther 1912", lang_code: "DE" },
    { bible_code: "mgtr", abb_bible_name: "MG/TR", full_bible_name: "Modern Greek Old Testament, Textus Receptus 1894 New Testament", lang_code: "EL" },
    { bible_code: "mgreek", abb_bible_name: "MG", full_bible_name: "Modern Greek", lang_code: "EL" },
    { bible_code: "hhbd", abb_bible_name: "HHBD", full_bible_name: "Hindi Holy Bible (Dharmasastra)", lang_code: "HI" },
    { bible_code: "pavitr", abb_bible_name: "Pavitra", full_bible_name: "Hindi Transliterated Bible", lang_code: "HI" },
    { bible_code: "kar", abb_bible_name: "KAR", full_bible_name: "Károli", lang_code: "HU" },
    { bible_code: "tb", abb_bible_name: "TB", full_bible_name: "Terjemahan Baru", lang_code: "ID" },
    { bible_code: "riv", abb_bible_name: "RIV", full_bible_name: "Riveduta", lang_code: "IT" },
    { bible_code: "krv", abb_bible_name: "KRV", full_bible_name: "Korean Revised Version", lang_code: "KO" },
    { bible_code: "nbs", abb_bible_name: "NO1930", full_bible_name: "Det Norsk Bibelselskap 1930", lang_code: "NO" },
    { bible_code: "pbg", abb_bible_name: "PBG", full_bible_name: "Biblia Gdańska", lang_code: "PL" },
    { bible_code: "almeida", abb_bible_name: "Almeida", full_bible_name: "Almeida (1628-1691)", lang_code: "PT" },
    { bible_code: "acf", abb_bible_name: "ACF", full_bible_name: "Almeida Corrigida Fiel", lang_code: "PT" },
    { bible_code: "corn", abb_bible_name: "Cornilescu", full_bible_name: "Cornilescu 1924", lang_code: "RO" },
    { bible_code: "rusv", abb_bible_name: "RUSV", full_bible_name: "Synodal Version", lang_code: "RU" },
    { bible_code: "kjv", abb_bible_name: "KJV", full_bible_name: "King James Version", lang_code: "EN" },
    { bible_code: "drc", abb_bible_name: "DRC", full_bible_name: "Douay-Rheims Version", lang_code: "EN" },
    { bible_code: "cuvstudy", abb_bible_name: "CUV Study", full_bible_name: "English, Pinyin and Chinese Study", lang_code: "EN" },
    { bible_code: "vuk", abb_bible_name: "ДК", full_bible_name: "Даничић-Караџић", lang_code: "SR" },
    { bible_code: "dk", abb_bible_name: "ДК", full_bible_name: "Даничић-Караџић", lang_code: "CNR", license: "Public domain" },
    { bible_code: "dkb", abb_bible_name: "ДК", full_bible_name: "Даничић-Караџић", lang_code: "BS", license: "Public domain" },
    { bible_code: "rva", abb_bible_name: "RV1909", full_bible_name: "Reina Valera 1909 Antigua", lang_code: "ES" },
    { bible_code: "bibeln", abb_bible_name: "Bibeln", full_bible_name: "Bibeln", lang_code: "SV" },
    { bible_code: "kinhthanh", abb_bible_name: "Kinh Thánh", full_bible_name: "Kinh Thánh", lang_code: "VI" },
    { bible_code: "web", abb_bible_name: "WEB", full_bible_name: "World English Bible", lang_code: "EN", license: "Public domain" },
    { bible_code: "asv", abb_bible_name: "ASV", full_bible_name: "American Standard Version", lang_code: "EN", license: "Public domain" },
    { bible_code: "ylt", abb_bible_name: "YLT", full_bible_name: "Young's Literal Translation", lang_code: "EN", license: "Public domain" },
    { bible_code: "webster", abb_bible_name: "Webster", full_bible_name: "Webster's Bible", lang_code: "EN", license: "Public domain" },
    { bible_code: "lut1545", abb_bible_name: "LUT1545", full_bible_name: "Luther 1545", lang_code: "DE", license: "Public domain" },
    { bible_code: "elb1871", abb_bible_name: "ELB1871", full_bible_name: "Elberfelder 1871", lang_code: "DE", license: "Public domain" },
    { bible_code: "elb1905", abb_bible_name: "ELB1905", full_bible_name: "Elberfelder 1905", lang_code: "DE", license: "Public domain" },
    { bible_code: "martin", abb_bible_name: "MARTIN", full_bible_name: "Martin 1744", lang_code: "FR", license: "Public domain" },
    { bible_code: "darby", abb_bible_name: "DARBY", full_bible_name: "Bible Darby", lang_code: "FR", license: "Public domain" },
    { bible_code: "sse", abb_bible_name: "SSE", full_bible_name: "Sagradas Escrituras (1569)", lang_code: "ES", license: "Public domain" },
    { bible_code: "diodati", abb_bible_name: "Diodati", full_bible_name: "Giovanni Diodati 1649", lang_code: "IT", license: "Public domain" },
    { bible_code: "biblia1776", abb_bible_name: "Biblia", full_bible_name: "Biblia (1776)", lang_code: "FI", license: "Public domain" },
    { bible_code: "karl1873", abb_bible_name: "Karl XII", full_bible_name: "Karl XII:s Bibel (1873)", lang_code: "SV", license: "Public domain" },
    { bible_code: "sv1917", abb_bible_name: "SV1917", full_bible_name: "Svenska 1917", lang_code: "SV", license: "Public domain" },
    { bible_code: "smb", abb_bible_name: "SMB", full_bible_name: "Studentmållagsbibelen 1921", lang_code: "NO", license: "Public domain" },
    { bible_code: "baiboly", abb_bible_name: "Baiboly", full_bible_name: "Baiboly Malagasy (1865)", lang_code: "MG", license: "Public domain" },
    { bible_code: "wenli", abb_bible_name: "文理和合", full_bible_name: "文理和合本", lang_code: "ZH", license: "Public domain" },
    { bible_code: "blivre", abb_bible_name: "BLIVRE", full_bible_name: "Bíblia Livre", lang_code: "PT", license: "CC BY 4.0" },
    { bible_code: "blivretr", abb_bible_name: "BLIVRE TR", full_bible_name: "Bíblia Livre (Textus Receptus)", lang_code: "PT", license: "CC BY 4.0" },
    { bible_code: "vamvas", abb_bible_name: "Vamvas", full_bible_name: "Vamvas", lang_code: "EL", license: "Public domain" },
    { bible_code: "gluck", abb_bible_name: "Glück", full_bible_name: "Glika Bībele", lang_code: "LV", license: "Public domain" },
    { bible_code: "akjv", abb_bible_name: "AKJV", full_bible_name: "American King James Version", lang_code: "EN", license: "Copyright status unclear" },
    { bible_code: "bbe", abb_bible_name: "BBE", full_bible_name: "Bible in Basic English", lang_code: "EN", license: "Copyright status unclear" },
    { bible_code: "pr1933", abb_bible_name: "1933/38", full_bible_name: "Pyhä Raamattu (1933/1938)", lang_code: "FI", license: "Copyright status unclear" },
    { bible_code: "eesti", abb_bible_name: "Eesti", full_bible_name: "Estonian", lang_code: "ET", license: "Copyright status unknown" },
    { bible_code: "lvnt", abb_bible_name: "NT", full_bible_name: "Latvian New Testament", lang_code: "LV", license: "No license stated" },
    { bible_code: "krv1961", abb_bible_name: "개역한글", full_bible_name: "개역한글판 (1952/1961)", lang_code: "KO", license: "Copyright status unclear" },
    { bible_code: "almeida1911", abb_bible_name: "Almeida 1911", full_bible_name: "Almeida (1911)", lang_code: "PT", license: "Copyright status unclear" },
    { bible_code: "synodal", abb_bible_name: "СП", full_bible_name: "Синодальный перевод", lang_code: "RU", license: "Public domain" },
    { bible_code: "stritar", abb_bible_name: "Stritar", full_bible_name: "Novi testament in Psalmi Davidovi Josipa Stritarja (1882)", lang_code: "SL", license: "Public domain" },
    { bible_code: "tpv", abb_bible_name: "TPV", full_bible_name: "Tikinčiųjų paveldo vertimas", lang_code: "LT", license: "CC BY-SA 4.0. © 2022–2024 Believers' Bible Society, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "onpk", abb_bible_name: "ONPK", full_bible_name: "Biblica® Nádej pre každého, verejne dostupné", lang_code: "SK", license: "CC BY-SA 4.0. © 1993, 2023 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "bsb", abb_bible_name: "BSB", full_bible_name: "Berean Standard Bible", lang_code: "EN", license: "Public domain" },
    { bible_code: "fbv", abb_bible_name: "FBV", full_bible_name: "Free Bible Version", lang_code: "EN", license: "CC BY-SA 4.0. © 2018 Dr. Jonathan Gallagher https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "spaonbv", abb_bible_name: "ONBV", full_bible_name: "Biblica® Open Nueva Biblia Viva 2008", lang_code: "ES", license: "CC BY-SA 4.0. © 2008 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "bes", abb_bible_name: "BES", full_bible_name: "La Biblia en Español Sencillo", lang_code: "ES", license: "CC BY 4.0. © 2018, 2019 AudioBiblia.org /Irma Flores https://creativecommons.org/licenses/by/4.0/" },
    { bible_code: "vbl", abb_bible_name: "VBL", full_bible_name: "Versión Biblia Libre", lang_code: "ES", license: "CC BY-SA 4.0. © 2018-2020 Jonathan Gallagher y Shelly Barrios de Avila https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "esulb", abb_bible_name: "ULB", full_bible_name: "Español Latino Americano ULB", lang_code: "ES", license: "CC BY-SA 4.0. Door43 World Missions Community / Wycliffe Associates https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "poronbv", abb_bible_name: "ONBV", full_bible_name: "Biblica® Open Nova Bíblia Viva 2007", lang_code: "PT", license: "CC BY-SA 4.0. © 2007, 2010 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "nva", abb_bible_name: "NVA", full_bible_name: "Bíblia Nova Versão de Acesso Livre", lang_code: "PT", license: "CC BY-SA 4.0. Door43 World Missions Community / Wycliffe Associates https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "cmncbs", abb_bible_name: "CBS", full_bible_name: "Biblica® 圣经当代译本开放资源", lang_code: "ZH", license: "CC BY-SA 4.0. © 1979,2005,2007,2011,2022 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "cmncbt", abb_bible_name: "CBT", full_bible_name: "Biblica® 聖經，當代譯本開放資源", lang_code: "ZH", license: "CC BY-SA 4.0. © 1979,2005,2007,2012,2023 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "ckjvs", abb_bible_name: "CKJVSD/S", full_bible_name: "中文英皇钦定本上帝版 Chinese KJV (Simplified) Shang-Di 简体中文", lang_code: "ZH", license: "CC BY-SA 3.0. https://creativecommons.org/licenses/by-sa/3.0/" },
    { bible_code: "ckjvt", abb_bible_name: "CKJVSD/T", full_bible_name: "中文英皇欽定本上帝版 Chinese KJV (Traditional) Shang-Di 繁體中文", lang_code: "ZH", license: "CC BY-SA 3.0. https://creativecommons.org/licenses/by-sa/3.0/" },
    { bible_code: "ohss", abb_bible_name: "OHSS", full_bible_name: "Biblica® हिंदी समकालीन संस्करण-स्वतंत्र उपलब्धि", lang_code: "HI", license: "CC BY-SA 4.0. © 1978, 2009, 2016, 2019 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "irvhin", abb_bible_name: "IRVHin", full_bible_name: "इंडियन रिवाइज्ड वर्जन (IRV) हिंदी - 2019", lang_code: "HI", license: "CC BY-SA 4.0. © 2017, 2018, 2019 Bridge Connectivity Solutions https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "hiudb", abb_bible_name: "UDB", full_bible_name: "Unlocked Dynamic Bible - Hindi", lang_code: "HI", license: "CC BY-SA 4.0. Door43 World Missions Community https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "onsp", abb_bible_name: "ONSP", full_bible_name: "Biblica® Нови српски превод, слободна права", lang_code: "SR", license: "CC BY-SA 4.0. © 2005, 2017 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "onst", abb_bible_name: "ONST", full_bible_name: "Biblica® Novi srpski prevod, slobodna prava", lang_code: "SR", license: "CC BY-SA 4.0. © 2005 2017 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "ovcb", abb_bible_name: "OVCB", full_bible_name: "Biblica® Thiên Ban Kinh Thánh Hiện Đại™", lang_code: "VI", license: "CC BY-SA 4.0. © 2015 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "viulb", abb_bible_name: "ULB", full_bible_name: "Unlocked Literal Bible - Tiếng Việt", lang_code: "VI", license: "CC BY-SA 4.0. Wycliffe Associates https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "ncl", abb_bible_name: "NCL", full_bible_name: "Sainte Bible néo-Crampon Libre", lang_code: "FR", license: "CC BY-SA 4.0. © 2022 Fraternité de Tibériade https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "oecv", abb_bible_name: "OECV", full_bible_name: "Biblica® Vaba kasutusega Uus Testament, Pühakiri kaasaegses eesti keeles", lang_code: "ET", license: "CC BY-SA 4.0. © 2022 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "aeuut", abb_bible_name: "AEUUT", full_bible_name: "Biblica® Avoin Elävä uutinen: Uusi testamentti vapaasti kerrottuna", lang_code: "FI", license: "CC BY-SA 4.0. © 1976 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "okok", abb_bible_name: "OKOK", full_bible_name: "Biblica® Open Knjiga O Kristu", lang_code: "HR", license: "CC BY-SA 4.0. © 1982, 1992, 2000 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "neiv", abb_bible_name: "NEIV", full_bible_name: "Biblica® Nyitott Újszövetség: élet, igazság és világosság", lang_code: "HU", license: "CC BY-SA 4.0. © 2021 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "oelb", abb_bible_name: "OELB", full_bible_name: "Biblica® Open En Levende Bok: Det Nye Testamentet", lang_code: "NO", license: "CC BY-SA 4.0. © 1978, 1988, 2005 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "oplnt", abb_bible_name: "OPLNT", full_bible_name: "Biblica® Słowo Życia, otwarty dostęp", lang_code: "PL", license: "CC BY-SA 4.0. © 1991, 2005, 2016 Biblica, Inc. https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "tpiulb", abb_bible_name: "ULB", full_bible_name: "Tok Pisin Unlocked Literal Bible", lang_code: "TPI", license: "CC BY-SA 4.0. Door43 World Missions Community / Wycliffe Associates https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "ruulb", abb_bible_name: "ULB", full_bible_name: "Russian Unlocked Literal Bible", lang_code: "RU", license: "CC BY-SA 4.0. Door43 World Missions Community / Wycliffe Associates https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "pltulb", abb_bible_name: "ULB", full_bible_name: "Unlocked Literal Bible - Plateau Malagasy", lang_code: "MG", license: "CC BY-SA 4.0. Door43 World Missions Community https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "idulb", abb_bible_name: "ULB", full_bible_name: "Unlocked Literal Bible - Indonesian", lang_code: "ID", license: "CC BY-SA 4.0. Door43 World Missions Community https://creativecommons.org/licenses/by-sa/4.0/" },
    { bible_code: "menge", abb_bible_name: "Menge", full_bible_name: "Menge-Bibel (1939)", lang_code: "DE", license: "Public domain" }
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

    for (const bible_version of BIBLE_VERSIONS) {
        const langResult = await pg.query(
            "rw",
            `
                SELECT id_lang
                FROM languages 
                WHERE lang_code = $1
            `,
            [
                bible_version.lang_code
            ]
        )

        const idLang = langResult.rows[0]?.id_lang

        if (!idLang) {
            logger.warn(`No language row for ${bible_version.lang_code}`)
            continue
        }

        await pg.query(
            "rw",
            `
                INSERT INTO bible_text_versions (bible_code, abb_bible_name, full_bible_name, is_audio_available, license, id_lang)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (bible_code) DO UPDATE
                SET license = COALESCE(EXCLUDED.license, bible_text_versions.license);
            `,
            [
                bible_version.bible_code,
                bible_version.abb_bible_name,
                bible_version.full_bible_name,
                null,
                bible_version.license || null,
                idLang
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