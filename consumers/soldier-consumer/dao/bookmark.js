import pg from "../utils/pgQueryEngine.js"

async function syncBookmarks(bookmarks, id_user) {
    const created = {
        books: [],
        chapters: [],
        verses_combinations: [],
        dates: [],
        uuids: [],
        bible_ids: []
    }

    if (bookmarks["created"]) {
        for (const bookmark of bookmarks["created"]) {
            created.books.push(bookmark.book)
            created.chapters.push(bookmark.chapter)
            created.verses_combinations.push(JSON.stringify(bookmark.verses_combination))
            created.dates.push(bookmark.date)
            created.uuids.push(bookmark.uuid)
            created.bible_ids.push(bookmark.bible_id)
        }
    }
    
    await pg.queryTransaction(async (client) => {
        if (bookmarks["created"]) {
            await client.query(
                `
                    INSERT INTO 
                    bookmarks(
                        book,
                        chapter,
                        verses_combination,
                        date,
                        entity_uuid,
                        id_user,
                        id_bible_text_version
                    ) SELECT * FROM UNNEST(
                        $1::varchar[],
                        $2::int[],
                        $3::jsonb[],
                        $4::date[],
                        $5::uuid[],
                        $6::int[],
                        $7::int[]
                    ) AS temp(book, chapter, verses_combination, date, uuid, id_user, bible_id)
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
                    created.dates,
                    created.uuids,
                    Array(created.uuids.length).fill(id_user),
                    created.bible_ids
                ]
            )
        }

        if (bookmarks["deleted"]) {
            await client.query(
                `
                    DELETE FROM bookmarks
                    WHERE entity_uuid = ANY($1::uuid[])
                `,
                [
                    bookmarks["deleted"]
                ]
            )
        }
    })
}

export default { 
    syncBookmarks: syncBookmarks
}