import pg from "../utils/pgQueryEngine.js"

async function findCustomerById(customerId) {
    const result = await pg.query(
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

async function addNewCustomer(data, id_user) {
    await pg.queryTransaction(async (client) => {    //Possible because trialing will
        if (data.data.status === "trialing") {    //be accessed by user only once then lockef on frontend
            await client.query(
                `
                    INSERT INTO customers (
                        subscription_id,
                        customer_id,
                        subscription_tier,
                        subscription_status,
                        interval,
                        occurred_at,
                        id_user,
                        is_free_trial_used
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `,
                [
                    data.data.id,
                    data.data.customerId,
                    data.data.items[0].product.name,
                    data.data.status,
                    data.data.items[0].price.billingCycle.interval,
                    data.occurredAt,
                    id_user,
                    true
                ]
            )
        } else {
            await client.query(
                `
                    INSERT INTO customers (
                        subscription_id,
                        customer_id,
                        subscription_tier,
                        subscription_status,
                        interval,
                        occurred_at,
                        id_user
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                `,
                [
                    data.data.id,
                    data.data.customerId,
                    data.data.items[0].product.name,
                    data.data.status,
                    data.data.items[0].price.billingCycle.interval,
                    data.occurredAt,
                    id_user
                ]
            )
        }
    })
}

async function updateCustomer(data, id_user) {
    await pg.queryTransaction(async (client) => {
        if (data.data.status === "trialing") {     // Possible because trialing will 
            await client.query(                    // be accessed by user only once then locked on frontend
                `
                    UPDATE customers
                    SET subscription_id = $1,
                    subscription_tier = $2,
                    subscription_status = $3,
                    interval = $4,
                    occurred_at = $5,
                    is_free_trial_used = TRUE
                    WHERE customer_id = $6
                    AND occurred_at < $7
                `,
                [
                    data.data.id,
                    data.data.items[0].product.name,
                    data.data.status,
                    data.data.items[0].price.billingCycle.interval,
                    data.occurredAt,
                    data.data.customerId,
                    data.occurredAt
                ]
            )
        } else {
            await pg.query(
                `
                    UPDATE customers
                    SET subscription_id = $1,
                    subscription_tier = $2,
                    subscription_status = $3,
                    interval = $4,
                    occurred_at = $5
                    WHERE customer_id = $6
                    AND occurred_at < $7
                `,
                [
                    data.data.id,
                    data.data.items[0].product.name,
                    data.data.status,
                    data.data.items[0].price.billingCycle.interval,
                    data.occurredAt,
                    data.data.customerId,
                    data.occurredAt
                ]
            )
        }
    })
}

async function getAllCustomerInfoById(id_user) {
    const result = await pg.query(
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
    addNewCustomer: addNewCustomer,
    updateCustomer: updateCustomer,
    getAllCustomerInfoById: getAllCustomerInfoById
}