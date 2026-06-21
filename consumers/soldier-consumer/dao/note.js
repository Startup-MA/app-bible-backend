import pg from "../utils/pgQueryEngine.js"

async function syncNotes(notes, id_user) {
    const created = {
        books: [],
        chapters: [],
        verses_combinations: [],
        contents: [],
        dates: [],
        uuids: [],
        bible_ids: []
    }

    const updated = {
        new_contents: [],
        uuids: [],
        updated_ats: []
    }

    if (notes["created"]) {
        for (const note of notes["created"]) {
            created.books.push(note.book)
            created.chapters.push(note.chapter)
            created.verses_combinations.push(JSON.stringify(note.verses_combination))
            created.contents.push(note.content)
            created.dates.push(note.date)
            created.uuids.push(note.uuid)
            created.bible_ids.push(note.bible_id)
        }
    }

    if (notes["updated"]) {
        for (const note of notes["updated"]) {
            updated.new_contents.push(note.new_content),
            updated.uuids.push(note.uuid),
            updated.updated_ats.push(note.updated_at)
        }
    }

    await pg.queryTransaction(async (client) => {
        if (notes["created"]) {
            await client.query(
                `
                    INSERT INTO 
                    notes(
                        book,
                        chapter,
                        verses_combination,
                        content,
                        date,
                        entity_uuid,
                        id_user,
                        id_bible_text_version
                    ) SELECT * FROM UNNEST(
                        $1::varchar[],
                        $2::int[],
                        $3::jsonb[],
                        $4::varchar[],
                        $5::date[],
                        $6::uuid[],
                        $7::int[],
                        $8::int[]
                    ) AS temp(book, chapter, verses_combination, content, date, uuid, id_user, bible_id)
                    WHERE EXISTS (
                        SELECT 1 FROM bible_text_versions
                        WHERE id_bible_text_version = temp.bible_id 
                    )
                    ON CONFLICT (entity_uuid) DO NOTHING
                `,
                [
                    created.books,
                    created.chapters,
                    created.verses_combinations,
                    created.contents,
                    created.dates,
                    created.uuids,
                    Array(created.uuids.length).fill(id_user),
                    created.bible_ids
                ]
            )
        }   

        if (notes["updated"]) {
            await client.query(
                `
                    UPDATE notes AS n
                    SET content = temp.new_content,
                    updated_at = CASE
                        WHEN temp.updated_at > NOW() THEN NOW()
                        ELSE temp.updated_at
                    END
                    FROM UNNEST($1::varchar[], $2::uuid[], $3::timestamp[])
                    AS temp(new_content, uuid, updated_at)
                    WHERE n.entity_uuid = temp.uuid
                    AND n.updated_at < temp.updated_at
                `,
                [
                    updated.new_contents,
                    updated.uuids,
                    updated.updated_ats
                ]
            )
        }

        if (notes["deleted"]) {
            await client.query(
                `
                    DELETE FROM notes
                    WHERE entity_uuid = ANY($1::uuid[])
                `,
                [
                    notes["deleted"]
                ]
            )
        }
    })
}

export default { 
    syncNotes: syncNotes
}