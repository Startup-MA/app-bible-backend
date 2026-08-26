import pg from "../utils/pgQueryEngine.js"

async function registerNewUser(email, authProvider, googleId) {
    const result = await pg.queryTransaction("rw", async (client) => {
        const id = await client.query(
            `
                INSERT INTO
                users(email, auth_provider)
                VALUES($1, $2)
                RETURNING id_user
            `,
            [
                email,
                authProvider
            ]
        )

        await client.query(
            `    
                INSERT INTO
                users_google_auth_info(google_id, id_user)
                VALUES($1, $2)
            `,
            [
                googleId,
                id["rows"][0]["id_user"]
            ]
        )

        return [{
            id_user: id["rows"][0]["id_user"]
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
            auth_provider
            FROM users
            WHERE email = $1
        `,
        [
            email
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

async function findUserByGoogleId(googleId) {
    const result = await pg.query(
        "r",
        `
            SELECT
            email, google_id, users_google_auth_info.id_user 
            FROM users_google_auth_info 
            LEFT JOIN users
            ON users.id_user = users_google_auth_info.id_user
            WHERE google_id = $1;
        `,
        [
            googleId
        ]
    )

    return result["rows"]
}

export default {
    registerNewUser: registerNewUser,
    findUserByEmail: findUserByEmail,
    findUserById: findUserById,
    findUserByToken: findUserByToken,
    findUserByCode: findUserByCode,
    findUserByGoogleId: findUserByGoogleId
}