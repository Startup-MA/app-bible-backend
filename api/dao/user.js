import pg from "../utils/pgQueryEngine.js"
import { randomUUID } from "crypto"

async function registerNewUser(email, auth_provider, client_id, refresh_token = null, delete_ver_code = false, platform = null) {
    const result = await pg.queryTransaction("rw", async (client) => {
        const user = await client.query(
            `
                INSERT INTO
                users(email, auth_provider, entity_uuid)
                VALUES($1, $2, $3)
                RETURNING id_user, is_admin
            `,
            [
                email,
                auth_provider,
                randomUUID()
            ]
        )

        if (auth_provider === "google") {
            await client.query(
                `    
                    INSERT INTO
                    users_google_auth_info(google_sub, id_user)
                    VALUES($1, $2)
                `,
                [
                    client_id,
                    user["rows"][0]["id_user"]
                ]
            )
        } else {
            await client.query(
                `    
                    INSERT INTO
                    users_apple_auth_info(apple_sub, refresh_token, login_platform, id_user)
                    VALUES($1, $2, $3, $4)
                `,
                [
                    client_id,
                    refresh_token,
                    platform,
                    user["rows"][0]["id_user"]
                ]
            )
        }

        if (delete_ver_code) {
            await client.query(
                `    
                    DELETE FROM
                    hidden_email_verification_codes
                    WHERE email = $1
                `,
                [
                    email
                ]
            )
        }

        return [{
            id_user: user["rows"][0]["id_user"],
            is_admin: user["rows"][0]["is_admin"]
        }]
    })

    return result
}

async function findUserByEmail(email) {
    const result = await pg.query(
        "r",
        `
            SELECT
            id_user,
            email,
            password,
            auth_provider,
            is_admin
            FROM users
            WHERE email = $1
        `,
        [
            email
        ]
    )

    return result["rows"]
}

async function findUserByUUID(uuid) {
    const result = await pg.query(
        "r",
        `
            SELECT
            id_user,
            email,
            password,
            auth_provider,
            is_admin
            FROM users
            WHERE entity_uuid = $1
        `,
        [
            uuid
        ]
    )

    return result["rows"]
}

async function findUserById(id_user) {
    const result = await pg.query(
        "r",
        `
            SELECT
            users.id_user,
            name,
            surname,
            age,
            sex,
            country,
            personal_info,
            is_admin
            FROM users
            LEFT JOIN
            personal_infos
            ON users.id_user = personal_infos.id_user
            WHERE users.id_user = $1
        `,
        [
            id_user
        ]
    )

    return result["rows"]
}

async function findUserByToken(table_name, uuid) {
    const result = await pg.query(
        "r",
        `
            SELECT
            id_user
            FROM ${table_name}
            WHERE uuid = $1
            AND expires_at > CURRENT_TIMESTAMP
        `,
        [
            uuid
        ]
    )

    return result["rows"]
}

async function findUserByCode(code) {
    const result = await pg.query(
        "r",
        `
            SELECT
            users.id_user,
            users.is_admin
            FROM users
            LEFT JOIN verification_codes
            ON users.id_user = verification_codes.id_user
            WHERE code = $1
            AND expires_at > CURRENT_TIMESTAMP
        `,
        [
            code
        ]
    )

    return result["rows"]
}

async function findUserByEmailAndCode(email, code) {
    const result = await pg.query(
        "r",
        `
            SELECT
            email
            FROM hidden_email_verification_codes
            WHERE email = $1
            AND code = $2
            AND expires_at > CURRENT_TIMESTAMP
        `,
        [
            email,
            code
        ]
    )

    return result["rows"]
}

async function findUserByGoogleSub(google_sub) {
    const result = await pg.query(
        "r",
        `
            SELECT
            email, google_sub, users_google_auth_info.id_user, is_admin
            FROM users_google_auth_info 
            LEFT JOIN users
            ON users.id_user = users_google_auth_info.id_user
            WHERE google_sub = $1;
        `,
        [
            google_sub
        ]
    )

    return result["rows"]
}

async function findUserByAppleSub(apple_sub) {
    const result = await pg.query(
        "r",
        `
            SELECT
            email, apple_sub, users_apple_auth_info.id_user, is_admin 
            FROM users_apple_auth_info 
            LEFT JOIN users
            ON users.id_user = users_apple_auth_info.id_user
            WHERE apple_sub = $1;
        `,
        [
            apple_sub
        ]
    )

    return result["rows"]
}

async function verifyUserAppleSub(id_user) {
    const result = await pg.query(
        "r",
        `
            SELECT
            apple_sub, refresh_token, login_platform 
            FROM users_apple_auth_info 
            WHERE id_user = $1;
        `,
        [
            id_user
        ]
    )

    return result["rows"]
}

async function deleteAllUserData(id_user, email) {
    await pg.queryTransaction("rw", async (client) => {
        await client.query(
            `
                DELETE FROM
                users
                WHERE id_user = $1
            `,
            [
                id_user
            ]
        )

        await client.query(
            `    
                DELETE FROM
                hidden_email_verification_codes
                WHERE email = $1
            `,
            [
                email
            ]
        )
    })
}

export default {
    registerNewUser: registerNewUser,
    findUserByEmail: findUserByEmail,
    findUserById: findUserById,
    findUserByUUID: findUserByUUID,
    findUserByToken: findUserByToken,
    findUserByCode: findUserByCode,
    findUserByGoogleSub: findUserByGoogleSub,
    findUserByAppleSub: findUserByAppleSub,
    findUserByEmailAndCode: findUserByEmailAndCode,
    verifyUserAppleSub: verifyUserAppleSub,
    deleteAllUserData: deleteAllUserData
}