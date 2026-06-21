import pg from "../utils/pgQueryEngine.js"

async function syncHighlights(highlights, id_user) {
    const created = {
        books: [],
        chapters: [],
        highlights: [],
        uuids: [],
        bible_ids: []
    }

    const updated = {
        new_highlights: [],
        uuids: [],
        updated_ats: []
    }

    if (highlights["created"]) {
        for (const highlight of highlights["created"]) {
            created.books.push(highlight.book)
            created.chapters.push(highlight.chapter)
            created.highlights.push(JSON.stringify(highlight.highlights))
            created.uuids.push(highlight.uuid)
            created.bible_ids.push(highlight.bible_id)
        }
    }

    if (highlights["updated"]) {
        for (const highlight of highlights["updated"]) {
            updated.new_highlights.push(JSON.stringify(highlight.new_highlights))
            updated.uuids.push(highlight.uuid),
            updated.updated_ats.push(highlight.updated_at)
        }
    }

    await pg.queryTransaction(async (client) => {
        if (highlights["created"]) {
            await client.query(
                `
                    INSERT INTO 
                    highlights (
                        book,
                        chapter,
                        highlights_json,
                        entity_uuid,
                        id_user,
                        id_bible_text_version
                    ) SELECT * FROM UNNEST (
                        $1::varchar[],
                        $2::int[],
                        $3::jsonb[],
                        $4::uuid[],
                        $5::int[],
                        $6::int[]
                    ) AS temp(books, chapter, highlights_json, uuid, id_user, bible_id)
                    WHERE EXISTS (
                        SELECT 1 FROM bible_text_versions
                        WHERE id_bible_text_version = temp.bible_id 
                    )
                    ON CONFLICT (entity_uuid) DO NOTHING
                `,
                [
                    created.books,
                    created.chapters,
                    created.highlights,
                    created.uuids,
                    Array(created.uuids.length).fill(id_user),
                    created.bible_ids,
                ]
            )
        }   

        if (highlights["updated"]) {
            await client.query(
                    `
                    UPDATE highlights AS h
                    SET highlights_json = temp.new_highlight,
                    updated_at = CASE
                        WHEN temp.updated_at > NOW() THEN NOW()
                        ELSE temp.updated_at
                    END
                    FROM UNNEST($1::jsonb[], $2::uuid[], $3::timestamp[])
                    AS temp(new_highlight, uuid, updated_at)
                    WHERE h.entity_uuid = temp.uuid
                    AND h.updated_at < temp.updated_at
                `,
                [
                    updated.new_highlights,
                    updated.uuids,
                    updated.updated_ats
                ]
            )
        }

        if (highlights["deleted"]) {
            await client.query(
                `
                    DELETE FROM highlights
                    WHERE entity_uuid = ANY($1::uuid[])
                `,
                [
                    highlights["deleted"]
                ]
            )
        }
    })
}

export default { 
    syncHighlights: syncHighlights
}