import pg from "../utils/pgQueryEngine.js"

async function updateAppVersion(versions) {
    await pg.query(
        `
            INSERT INTO 
            app_version(versions)
            VALUES($1)
        `,
        [
            versions
        ]
    )
}

async function createTicket(ticket) {
    await pg.query(
        `
            INSERT INTO 
            users_tickets(
                subject,
                name,
                email,
                timestamp,
                message
            ) VALUES($1, $2, $3, $4, $5)
        `,
        [
            ticket["subject"],
            ticket["name"],
            ticket["email"],
            ticket["timestamp"],
            ticket["message"]
        ]
    )
}

async function deleteTickets(from, to) {
    await pg.query(
        `
            DELETE FROM 
            users_tickets
            WHERE id_ticket >= $1
            AND id_ticket <= $2
        `,
        [
            from,
            to
        ]
    )
}

export default { 
    updateAppVersion: updateAppVersion,
    createTicket: createTicket,
    deleteTickets: deleteTickets
}