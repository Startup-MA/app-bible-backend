import pg from "../utils/pgQueryEngine.js"

async function syncPrayers(prayers, id_user) {
    const created = {
        titles: [],
        contents: [],
        uuids: [],
    }

    const updated = {
        new_titles: [],
        new_contents: [],
        uuids: [],
        updated_ats: []
    }

    if (prayers["created"]) {
        for (const prayer of prayers["created"]) {
            created.titles.push(prayer.title)
            created.contents.push(prayer.content)
            created.uuids.push(prayer.uuid)
        }
    }

    if (prayers["updated"]) {
        for (const prayer of prayers["updated"]) {
            updated.new_titles.push(prayer.new_title),
            updated.new_contents.push(prayer.new_content),
            updated.uuids.push(prayer.uuid),
            updated.updated_ats.push(prayer.updated_at)
        }
    }

    await pg.queryTransaction(async (client) => {
        if (prayers["created"]) {
            await client.query(
                `
                    INSERT INTO 
                    prayers(
                        prayer_title,
                        prayer_content,
                        entity_uuid,
                        id_user
                    ) SELECT * FROM UNNEST(
                        $1::varchar[],
                        $2::varchar[],
                        $3::uuid[],
                        $4::int[]
                    ) ON CONFLICT (entity_uuid) DO NOTHING
                `,
                [
                    created.titles,
                    created.contents,
                    created.uuids,
                    Array(created.uuids.length).fill(id_user),
                ]
            )
        }   

        if (prayers["updated"]) {
            await client.query(
                `
                    UPDATE prayers AS pl
                    SET
                    prayer_title = temp.new_title,
                    prayer_content = temp.new_content,
                    updated_at = CASE
                        WHEN temp.updated_at > NOW() THEN NOW()
                        ELSE temp.updated_at
                    END
                    FROM UNNEST($1::varchar[], $2::varchar[], $3::uuid[], $4::timestamp[])
                    AS temp(new_title, new_content, uuid, updated_at)
                    WHERE pl.entity_uuid = temp.uuid
                    AND pl.updated_at < temp.updated_at
                `,
                [
                    updated.new_titles,
                    updated.new_contents,
                    updated.uuids,
                    updated.updated_ats
                ]
            )
        }

        if (prayers["deleted"]) {
            await client.query(
                `
                    DELETE FROM prayers
                    WHERE entity_uuid = ANY($1::uuid[])
                `,
                [
                    prayers["deleted"]
                ]
            )
        }
    })
}

export default { 
    syncPrayers: syncPrayers
}