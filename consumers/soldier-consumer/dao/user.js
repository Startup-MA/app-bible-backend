import pg from "../utils/pgQueryEngine.js"
import dotenv from "dotenv"
import { randomUUID, randomInt } from "crypto"
import { logger } from "../utils/logger.js"

dotenv.config()

async function skipPersonalInfo(id_user) {
    await pg.query(
        `
            UPDATE personal_infos
            SET personal_info = TRUE
            WHERE id_user = $1
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

async function registerNewUser(email, password, code) {
    const result = await pg.queryTransaction(async (client) => {
        const id = await client.query(
            `
                INSERT INTO
                users(email, password)
                VALUES($1, $2)
                RETURNING id_user
            `,
            [
                email,
                password
            ]
        )

        // const code = await client.query( //vremenno
        await client.query(
            `    
                INSERT INTO
                verification_codes(code, id_user)
                VALUES($1, $2)
                RETURNING code
            `,
            [
                // randomInt(100000, 999999),
                code, // vremenno
                id["rows"][0]["id_user"]
            ]
        )

        return [{
            id: id["rows"][0]["id_user"],
            // code: code["rows"][0]["code"] //vremenno
            code: code
        }]
    })
    
    return result
}

async function sendNewVerificationCode(id_user, code) {
    const result = await pg.queryTransaction(async (client) => {
        // let code = "" // vremenno

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
                    // randomInt(100000, 999999),
                    code, //vremenno
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
                // randomInt(100000, 999999),
                code, //vremenno
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
    skipPersonalInfo: skipPersonalInfo,
    updateProfile: updateProfile,
    registerNewUser: registerNewUser,
    sendNewVerificationCode: sendNewVerificationCode,
    deleteUserVerificationCode: deleteUserVerificationCode,
    createPasswordResetLink: createPasswordResetLink,
    updatePassword: updatePassword
}