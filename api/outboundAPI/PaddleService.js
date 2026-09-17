import BaseApiClient from "./BaseApiClient.js"
import AppError from "../errors/AppError.js"

class PaddleService extends BaseApiClient {
    constructor() {
        super({
            baseURL: `https://${process.env.PADDLE_API_URL}`,
            headers: {
                "Authorization": `Bearer ${process.env.PADDLE_API_KEY}`,
                "Content-Type": "application/json"
            },
            rateLimit: {
                keyPrefix: "limit:paddle",
                points: 240,
                duration: 60
            }
        })
    }

    getCustomerByEmail(email) {
        return this.request(
            { method: "GET", url: `/customers?${new URLSearchParams({email: email})}` }
        )
    }

    getSubscription(subscription_id) {
        return this.request(
            { method: "GET", url: `/subscriptions/${subscription_id}` }
        )
    }

    async getCurrentPaymentMethod(subscription_id, customer_id) {
        const params = {
            subscription_id: subscription_id,
            customer_id: customer_id,
            origin: [
                "web",
                "subscription_recurring",
                "subscription_update",
                "subscription_payment_method_change"
            ].join(","),
            order_by: "id[DESC]",
            status: "completed",
            per_page: 30
        }

        let has_more = true

        let options = {
            method: "GET",
            url: `/transactions`,
            params: params
        }

        let paymentMethod = ""

        while(has_more) {

            const result = await this.request(options)

            for (let i = 0; i < result.data.length; i++) {
                if (result.data[i].payments.length) {
                    paymentMethod = result.data[i].payments[0].method_details
                    break
                }
            }

            // Successfully found payment method!

            if (paymentMethod) {
                return paymentMethod
            }

            options = {
                method: "GET",
                url: "/transactions" + result.meta.pagination.next.split("/transactions")[1],
            }

            has_more = result.meta.pagination.has_more
        }

        throw AppError.bad_gateway("Payment method wasn't found")
    }

    async getLastYearTransactions(subscription_id, customer_id) {
        const transactionsNumber = 30

        const params = {
            subscription_id: subscription_id,
            customer_id: customer_id,
            origin: [
                "web",
                "subscription_recurring",
                "subscription_update",
            ].join(","),
            order_by: "id[DESC]",
            status: ["completed", "past_due"].join(","),
            per_page: transactionsNumber
        }

        const transactions = []

        const result = await this.request({
            method: "GET",
            url: "/transactions",
            params: params
        }) 

        for (let i = 0; i < result.data.length && i < transactionsNumber; i++) {
            transactions[i] = {
                "origin": result.data[i].origin,
                "status": result.data[i].status,
                "details": {
                    totals: result.data[i].details.totals
                },
                "updated_at": result.data[i].updated_at
            }
        }

        if (transactions.length) {
            return transactions
        }
            
        throw AppError.bad_gateway("Empty transactions list")
    }

    async cancelCustomerActiveSubscriptions(customer_id) {
        const params = {
            customer_id: customer_id,
            status: [
                "active",
                "paused",
                "past_due",
                "trialing"
            ].join(","),
            per_page: 30
        }

        let has_more = true

        let options = {
            method: "GET",
            url: `/subscriptions`,
            params: params
        }

        const subscriptions = []

        while(has_more) {

            const result = await this.request(options)

            for (let i = 0; i < result.data.length; i++) {
                subscriptions.push(result.data[i].id)
            }

            options = {
                method: "GET",
                url: "/subscriptions" + result.meta.pagination.next.split("/subscriptions")[1],
            }

            has_more = result.meta.pagination.has_more
        }

        for (let i = 0; i < subscriptions.length; i++) {
            await this.request({
                method: "POST",
                url: `/subscriptions/${subscriptions[i]}/cancel`,
                data: {
                    effective_from: "immediately"
                }
            })
        }
    }

    async archiveCustomerAddresses(customer_id) {
        const params = {
            per_page: 30
        }

        let has_more = true

        let options = {
            method: "GET",
            url: `/customers/${customer_id}/addresses`,
            params: params
        }

        const addresses = []

        while(has_more) {

            const result = await this.request(options)

            for (let i = 0; i < result.data.length; i++) {
                addresses.push(result.data[i].id)
            }

            options = {
                method: "GET",
                url: `/customers/${customer_id}/addresses` + result.meta.pagination.next.split("/addresses")[1],
            }

            has_more = result.meta.pagination.has_more
        }

        for (let i = 0; i < addresses.length; i++) {
            await this.request({
                method: "PATCH",
                url: `/customers/${customer_id}/addresses/${addresses[i]}`,
                data: {
                    status: "archived"
                }
            })
        }
    }

    archiveCustomer(customer_id, uuid) {
        return this.request({
            method: "PATCH",
            url: `/customers/${customer_id}`,
            data: {
                email: `deleted-${uuid}@domain.invalid`,
                name: "Deleted User",
                status: "archived"
            }
        })
    }

    cancelSubscription(subscription_id) {
        return this.request({
            method: "POST",
            url: `/subscriptions/${subscription_id}/cancel`
        })
    }

    cancelScheduledCancel(subscription_id) {
        return this.request({
            method: "PATCH",
            url: `/subscriptions/${subscription_id}`,
            data: {
                "scheduled_change": null
            }
        })
    }

    getUpdatePaymentMethodTransaction(subscription_id) {
        return this.request({
            method: "GET",
            url: `/subscriptions/${subscription_id}/update-payment-method-transaction`,
        })
    }

    upgradePlan(subscription_id, data) {
        return this.request({
            method: "PATCH",
            url: `/subscriptions/${subscription_id}`,
            data: data
        })
    }
}

export default PaddleService