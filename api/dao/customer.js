import pg from "../utils/pgQueryEngine.js"

async function findCustomerById(customerId) {
    const result = await pg.query(
        "r",
        `
            SELECT 
            subscription_id,
            customer_id,
            subscription_tier,
            subscription_status,
            interval,
            occurred_at,
            id_user
            FROM customers
            WHERE customer_id = $1
        `,
        [
            customerId,
        ]
    )

    return result["rows"]
}

async function getAllCustomerInfoById(id_user) {
    const result = await pg.query(
        "r",
        `
            SELECT
            email, is_free_trial_used,
            subscription_id,
            customer_id, subscription_tier,
            subscription_status, interval
            FROM users 
            LEFT JOIN
            customers 
            ON users.id_user = customers.id_user
            WHERE users.id_user = $1        
        `,
        [
            id_user
        ]
    )

    return result["rows"]
}

export default {
    findCustomerById: findCustomerById,
    getAllCustomerInfoById: getAllCustomerInfoById
}