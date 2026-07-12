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
}

export default {
    addNewCustomer: addNewCustomer,
    updateCustomer: updateCustomer
}