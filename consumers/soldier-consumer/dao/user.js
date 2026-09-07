import pg from "../utils/pgQueryEngine.js"
import { randomUUID, randomInt } from "crypto"
import { logger } from "../utils/logger.js"

async function updateEmail(email, id_user) {
    await pg.query(
        `
            UPDATE users
            SET email = $1
            WHERE id_user = $2
        `,
        [
            email,
            id_user
        ]
    )
}

async function setGoogleSub(google_sub, id_user) {
    await pg.query(
        `
            INSERT INTO 
            users_google_auth_info(google_sub, id_user)
            VALUES ($1, $2)
        `,
        [
            google_sub,
            id_user
        ]
    )
}

async function setAppleSub(apple_sub, refresh_token, id_user) {
    await pg.query(
        `
            INSERT INTO 
            users_apple_auth_info(apple_sub, refresh_token, id_user)
            VALUES ($1, $2, $3)
        `,
        [
            apple_sub,
            refresh_token,
            id_user
        ]
    )
}

async function skipPersonalInfo(id_user) {
    await pg.query(
        `
            INSERT INTO 
            personal_infos (personal_info, id_user)
            VALUES (TRUE, $1)
        `,
        [
            id_user
        ]
    )
}

async function updateProfile(id_user, updateProfileData) {
    await pg.query(
        `
            INSERT INTO 
            personal_infos(name, surname, sex, country, age, personal_info, id_user)
            VALUES ($1, $2, $3, $4, $5, TRUE, $6)
            ON CONFLICT(id_user)
            DO UPDATE SET
            name = EXCLUDED.name, 
            surname = EXCLUDED.surname, 
            sex = EXCLUDED.sex,
            country = EXCLUDED.country,
            age = EXCLUDED.age,
            personal_info = EXCLUDED.personal_info,
            updated_at = $7
            WHERE personal_infos.updated_at < $7 
        `,
        [
            updateProfileData.name,
            updateProfileData.surname,
            updateProfileData.sex,
            updateProfileData.country,
            updateProfileData.age,
            id_user,
            updateProfileData.occurredAt
        ]
    )
}

async function createOrUpdateUserTopics(id_user, userTopics) {
    await pg.query(
        `
            INSERT INTO 
            users_topics(topics, id_user)
            VALUES ($1, $2)
            ON CONFLICT(id_user)
            DO UPDATE SET
            topics = EXCLUDED.topics,
            updated_at = $3
            WHERE users_topics.updated_at < $3
        `,
        [
            userTopics.topics.join(", "),
            id_user,
            userTopics.updated_at
        ]
    )
}

async function createOrUpdateUserVersePrayer(id_user, userLanguage, generatedContent) {
    const result = await pg.queryTransaction(async (client) => {
        const id_lang = await client.query(
            `
                SELECT id_lang
                FROM languages
                WHERE lang_name = $1
            `,
            [
                userLanguage["language"]
            ]
        )

        await client.query(
            `
                INSERT INTO 
                daily_verses(book, chapter, verse, id_user)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT(id_user)
                DO UPDATE SET
                book = EXCLUDED.book,
                chapter = EXCLUDED.chapter,
                verse = EXCLUDED.verse,
                updated_at = $5
                WHERE daily_verses.updated_at < $5
            `,
            [
                generatedContent["verse"]["book"],
                generatedContent["verse"]["chapter"],
                generatedContent["verse"]["verse"],
                id_user,
                userLanguage.updated_at
            ]
        )

        await client.query(
            `
                INSERT INTO 
                daily_prayers(prayer_title, prayer_content, id_user, id_lang)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT(id_user)
                DO UPDATE SET
                prayer_title = EXCLUDED.prayer_title,
                prayer_content = EXCLUDED.prayer_content,
                id_lang = EXCLUDED.id_lang,
                updated_at = $5
                WHERE daily_prayers.updated_at < $5
            `,
            [
                generatedContent["prayer"]["title"],
                generatedContent["prayer"]["prayer"],
                id_user,
                id_lang["rows"][0]["id_lang"],
                userLanguage.updated_at
            ]
        )
    })
}

async function registerNewUser(email, password, auth_provider) {
    const result = await pg.queryTransaction(async (client) => {
        const id = await client.query(
            `
                INSERT INTO
                users(email, password, auth_provider)
                VALUES($1, $2, $3)
                RETURNING id_user
            `,
            [
                email,
                password,
                auth_provider
            ]
        )

        const code = await client.query(
            `    
                INSERT INTO
                verification_codes(code, id_user)
                VALUES($1, $2)
                RETURNING code
            `,
            [
                randomInt(100000, 999999),
                id["rows"][0]["id_user"]
            ]
        )

        return [{
            id: id["rows"][0]["id_user"],
            code: code["rows"][0]["code"]
        }]
    })
    
    return result
}

async function sendNewVerificationCode(id_user, code) {
    const result = await pg.queryTransaction(async (client) => {
        let code = ""

        const user_code = await client.query(
            `
                SELECT 
                id_user
                FROM verification_codes
                WHERE id_user = $1
            `,
            [
                id_user
            ]
        )

        if (user_code["rows"].length) {
            code = await client.query(
                `
                    UPDATE
                    verification_codes
                    SET code = $1
                    WHERE id_user = $2
                    RETURNING code
                `,
                [   
                    randomInt(100000, 999999),
                    id_user
                ]
            )

            return code
        }
        
        code = await client.query(
            `    
                INSERT INTO
                verification_codes(code, id_user)
                VALUES($1, $2)
                RETURNING code
            `,
            [
                randomInt(100000, 999999),
                id_user
            ]
        )

        return code
    })

    return result["rows"]
}

async function deleteUserVerificationCode(code, id_user) {
    const result = await pg.queryTransaction(async (client) => {
        const result = await client.query(
            `
                DELETE FROM verification_codes
                WHERE code = $1
                AND id_user = $2
                RETURNING id_user
            `,
            [
                code,
                id_user
            ]
        )

        return result
    })

    return result["rows"]
}

async function createPasswordResetLink(email) {
    let isUserReset = {}
    let resetPasswordUUID = {}
    
    await pg.queryTransaction(async (client) => {
        isUserReset = await client.query(
            `
                SELECT 
                users.id_user,
                users.email,
                reset_passwords.id_reset_password,
                reset_passwords.uuid
                FROM users
                LEFT JOIN reset_passwords
                ON users.id_user = reset_passwords.id_user
                WHERE users.email = $1
            `,
            [
                email
            ]
        )

        if (isUserReset["rows"][0]["id_reset_password"]) {
            logger.warn("Reset uuid already exists: So update")

            resetPasswordUUID = await client.query(
                `
                    UPDATE reset_passwords
                    SET uuid = $1
                    WHERE id_user = $2
                    RETURNING uuid
                `,
                [
                    randomUUID(),
                    isUserReset["rows"][0]["id_user"]
                ]
            )
        } else {
            logger.info("There is no uuid exists: So create!")
            resetPasswordUUID = await client.query(
                `
                    INSERT INTO 
                    reset_passwords(uuid, id_user)
                    VALUES($1, $2)
                    RETURNING uuid
                `,
                [
                    randomUUID(),
                    isUserReset["rows"][0]["id_user"]
                ]
            )
        }
    })

    return resetPasswordUUID["rows"][0]["uuid"]
}

async function updatePassword(uuid, new_password) {
    await pg.queryTransaction(async (client) => {
        const id = await client.query(
            `
                DELETE FROM reset_passwords
                WHERE uuid = $1
                RETURNING id_user
            `,
            [
                uuid
            ]
        )

        await client.query(
            `
                UPDATE users
                SET password = $1
                WHERE id_user = $2
            `,
            [
                new_password,
                id["rows"][0]["id_user"]
            ]
        )
    })

}

export default {
    updateEmail: updateEmail,
    setGoogleSub: setGoogleSub,
    setAppleSub: setAppleSub,
    skipPersonalInfo: skipPersonalInfo,
    updateProfile: updateProfile,
    createOrUpdateUserTopics: createOrUpdateUserTopics,
    createOrUpdateUserVersePrayer: createOrUpdateUserVersePrayer,
    registerNewUser: registerNewUser,
    sendNewVerificationCode: sendNewVerificationCode,
    deleteUserVerificationCode: deleteUserVerificationCode,
    createPasswordResetLink: createPasswordResetLink,
    updatePassword: updatePassword
}