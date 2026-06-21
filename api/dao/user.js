import pg from "../utils/pgQueryEngine.js"
import { randomUUID, randomInt } from "crypto"

async function findUserByEmail(email) {
    const result = await pg.query(
        `
            SELECT
            id_user,
            email,
            password
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
        `
            SELECT
            id_user,
            name,
            surname,
            age,
            sex,
            country,
            personal_info,
            is_admin
            FROM users
            WHERE id_user = $1
        `,
        [
            id_user
        ]
    )

    return result["rows"]
}

async function findUserByToken(table_name, uuid) {
    const result = await pg.query(
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

async function setNewUUID(id_user) {

    const result = await pg.queryTransaction(async (client) => {
        let uuid = ""

        const user_ver = await client.query(
            `
                SELECT 
                id_user
                FROM users_verification
                WHERE id_user = $1
            `,
            [
                id_user
            ]
        )

        if (user_ver["rows"].length) {
            uuid = await client.query(
                `
                    UPDATE
                    users_verification
                    SET uuid = $1
                    WHERE id_user = $2
                    RETURNING uuid
                `,
                [   
                    randomUUID(),
                    id_user
                ]
            )

            return uuid
        }
        
        uuid = await client.query(
            `    
                INSERT INTO
                users_verification(uuid, id_user)
                VALUES($1, $2)
                RETURNING uuid
            `,
            [
                randomUUID(),
               id_user
            ]
        )

        return uuid 
    })

    return result["rows"]
}

export default {
    findUserByEmail: findUserByEmail,
    findUserById: findUserById,
    findUserByToken: findUserByToken,
    findUserByCode: findUserByCode,
    setNewUUID: setNewUUID,
}