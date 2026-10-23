import pg from "../utils/pgQueryEngine.js"
import dotenv from "dotenv"
import { randomUUID, randomInt } from "crypto"
import { logger } from "../utils/logger.js"


async function addNewCustomer(data, id_user) {              
    if (data.data.status === "trialing") {              //Possible because trialing will
        await pg.query(                       //be accessed by user only once then lockef on frontend
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
        await pg.query(
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
}

async function updateCustomer(data, id_user) {
    if (data.data.status === "trialing") {     // Possible because trialing will 
        await pg.query(                    // be accessed by user only once then locked on frontend
            `
                UPDATE customers
                SET subscription_id = $1,
                customer_id = $6,
                subscription_tier = $2,
                subscription_status = $3,
                interval = $4,
                occurred_at = $5,
                billing_provider = 'paddle',
                purchase_token = NULL,
                product_id = NULL,
                expires_at = NULL,
                store_status = NULL,
                is_free_trial_used = TRUE
                WHERE id_user = $8
                AND occurred_at < $7
                AND (customer_id = $6 OR billing_provider = 'google')
            `,
            [
                data.data.id,
                data.data.items[0].product.name,
                data.data.status,
                data.data.items[0].price.billingCycle.interval,
                data.occurredAt,
                data.data.customerId,
                data.occurredAt,
                id_user
            ]
        )
    } else {
        await pg.query(
            `
                UPDATE customers
                SET subscription_id = $1,
                customer_id = $6,
                subscription_tier = $2,
                subscription_status = $3,
                interval = $4,
                occurred_at = $5,
                billing_provider = 'paddle',
                purchase_token = NULL,
                product_id = NULL,
                expires_at = NULL,
                store_status = NULL
                WHERE id_user = $8
                AND occurred_at < $7
                AND (customer_id = $6 OR billing_provider = 'google')
            `,
            [
                data.data.id,
                data.data.items[0].product.name,
                data.data.status,
                data.data.items[0].price.billingCycle.interval,
                data.occurredAt,
                data.data.customerId,
                data.occurredAt,
                id_user
            ]
        )
    }
}

async function upsertGoogleSubscription(data, id_user) {
    await pg.query(
        `
            INSERT INTO customers (
                subscription_id,
                customer_id,
                subscription_tier,
                subscription_status,
                interval,
                occurred_at,
                id_user,
                billing_provider,
                purchase_token,
                product_id,
                expires_at,
                store_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'google', $8, $9, $10, $11)
            ON CONFLICT (id_user) DO UPDATE SET
                subscription_id = EXCLUDED.subscription_id,
                customer_id = EXCLUDED.customer_id,
                subscription_tier = EXCLUDED.subscription_tier,
                subscription_status = EXCLUDED.subscription_status,
                interval = EXCLUDED.interval,
                occurred_at = EXCLUDED.occurred_at,
                billing_provider = 'google',
                purchase_token = EXCLUDED.purchase_token,
                product_id = EXCLUDED.product_id,
                expires_at = EXCLUDED.expires_at,
                store_status = EXCLUDED.store_status
            WHERE customers.occurred_at IS NULL
            OR customers.occurred_at < EXCLUDED.occurred_at
        `,
        [
            data.subscription_id,
            data.customer_id,
            data.subscription_tier,
            data.subscription_status,
            data.interval,
            data.occurred_at,
            id_user,
            data.purchase_token,
            data.product_id,
            data.expires_at,
            data.store_status
        ]
    )
}

export default {
    addNewCustomer: addNewCustomer,
    updateCustomer: updateCustomer,
    upsertGoogleSubscription: upsertGoogleSubscription
}