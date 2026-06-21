import pg from "../utils/pgQueryEngine.js"

async function syncUserReadingHistory(readingHistory, id_user) {
    await pg.queryTransaction(async (client) => {
        if (readingHistory["created"]) {
            await client.query(
                `
                    INSERT INTO 
                    users_reading_history(
                        user_reading_history_json,
                        entity_uuid,
                        id_user
                    ) VALUES($1, $2, $3)
                `,
                [
                    readingHistory["created"]["user_reading_history_json"],
                    readingHistory["created"]["uuid"],
                    id_user,
                ]
            )
        } else {
            if (new Date(readingHistory["updated"]["updated_at"]).getTime() > new Date().getTime()) {
                await client.query(
                    `
                        UPDATE
                        users_reading_history
                        SET 
                        user_reading_history_json = $1,
                        updated_at = NOW()
                        WHERE entity_uuid = $2
                    `,
                    [
                        readingHistory["updated"]["new_user_reading_history_json"],
                        readingHistory["updated"]["uuid"],
                    ]
                )
            } else {
                await client.query(
                    `
                        UPDATE
                        users_reading_history
                        SET
                        user_reading_history_json = $1,
                        updated_at = $2
                        WHERE entity_uuid = $3
                        AND updated_at < $4
                    `,
                    [
                        readingHistory["updated"]["new_user_reading_history_json"],
                        readingHistory["updated"]["updated_at"],
                        readingHistory["updated"]["uuid"],
                        readingHistory["updated"]["updated_at"]
                    ]
                )
            }
        }  
    })
}

export default { 
    syncUserReadingHistory: syncUserReadingHistory
}