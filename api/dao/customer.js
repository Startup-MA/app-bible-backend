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
            users.id_user,
            email, is_free_trial_used,
            subscription_id,
            customer_id, subscription_tier,
            subscription_status, interval,
            billing_provider,
            purchase_token,
            product_id,
            expires_at,
            store_status,
            entity_uuid
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

async function findCustomerByPurchaseToken(purchaseToken) {
    const result = await pg.query(
        "r",
        `
            SELECT
            customers.id_user,
            customers.subscription_id,
            customers.customer_id,
            customers.subscription_tier,
            customers.subscription_status,
            customers.interval,
            customers.occurred_at,
            customers.billing_provider,
            customers.purchase_token,
            customers.product_id,
            customers.expires_at,
            customers.store_status,
            users.entity_uuid
            FROM customers
            JOIN users
            ON users.id_user = customers.id_user
            WHERE customers.purchase_token = $1
        `,
        [
            purchaseToken
        ]
    )

    return result["rows"]
}

export default {
    findCustomerById: findCustomerById,
    getAllCustomerInfoById: getAllCustomerInfoById,
    findCustomerByPurchaseToken: findCustomerByPurchaseToken
}