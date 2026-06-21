import pg from "../utils/pgQueryEngine.js"

async function syncPraylist(praylist, id_user) {
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

    if (praylist["created"]) {
        for (const pray of praylist["created"]) {
            created.titles.push(pray.title)
            created.contents.push(pray.content)
            created.uuids.push(pray.uuid)
        }
    }

    if (praylist["updated"]) {
        for (const pray of praylist["updated"]) {
            updated.new_titles.push(pray.new_title),
            updated.new_contents.push(pray.new_content),
            updated.uuids.push(pray.uuid),
            updated.updated_ats.push(pray.updated_at)
        }
    }

    await pg.queryTransaction(async (client) => {
        if (praylist["created"]) {
            await client.query(
                `
                    INSERT INTO 
                    pray_list(
                        pray_title,
                        pray_content,
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

        if (praylist["updated"]) {
            console.log(updated)
            await client.query(
                `
                    UPDATE pray_list AS pl
                    SET
                    pray_title = temp.new_title,
                    pray_content = temp.new_content,
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

        if (praylist["deleted"]) {
            await client.query(
                `
                    DELETE FROM pray_list
                    WHERE entity_uuid = ANY($1::uuid[])
                `,
                [
                    praylist["deleted"]
                ]
            )
        }
    })
}

export default { 
    syncPraylist: syncPraylist
}