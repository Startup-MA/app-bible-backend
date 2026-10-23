import AppError from "../errors/AppError.js"

const ACCESS_STATES = new Set([
    "SUBSCRIPTION_STATE_ACTIVE",
    "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"
])

const BLOCKING_STATES = new Set([
    "active",
    "trialing",
    "past_due",
    "paused",
    "pending"
])

function plans() {
    const plansByKey = new Map()
    const raw = process.env.GOOGLE_PLAY_PLANS || ""

    for (const part of raw.split(",")) {
        const [productId, basePlanId, tier, interval] = part.split(":").map((value) => value.trim())

        if (!productId || !basePlanId || !tier || !interval) continue
        if (tier !== "Premium") continue
        if (interval !== "month" && interval !== "year") continue

        plansByKey.set(`${productId}:${basePlanId}`, { tier, interval, productId })
    }

    return plansByKey
}

function latestLineItem(purchase) {
    const items = purchase.lineItems || []

    if (!items.length) {
        throw AppError.bad_request("Google Play purchase has no line items")
    }

    return items.reduce((latest, item) => {
        if (!latest) return item
        if (!item.expiryTime) return latest
        if (!latest.expiryTime) return item

        return new Date(item.expiryTime) > new Date(latest.expiryTime) ? item : latest
    }, null)
}

export function sandboxBlocks(purchase) {
    return process.env.GOOGLE_PLAY_SANDBOX !== "false" && !purchase.testPurchase
}

export function subscriptionInForce(customer) {
    if (!customer || !customer.subscription_id) return false

    if (customer.expires_at && new Date(customer.expires_at).getTime() > Date.now()) {
        if (customer.subscription_status === "canceled") return true
    }

    return BLOCKING_STATES.has(customer.subscription_status)
}

export function normalizeGooglePurchase(purchase, { occurredAt, notificationType, entityUuid }) {
    const lineItem = latestLineItem(purchase)
    const basePlanId = lineItem.offerDetails && lineItem.offerDetails.basePlanId
    const plan = plans().get(`${lineItem.productId}:${basePlanId}`)

    if (!plan) {
        throw AppError.bad_request("This Google Play product is not configured")
    }

    const externalId = purchase.externalAccountIdentifiers
        && purchase.externalAccountIdentifiers.obfuscatedExternalAccountId

    if (!externalId) {
        throw AppError.bad_request("Purchase is missing the account id. Set the obfuscated account id to the user uuid before buying.")
    }

    if (externalId !== entityUuid) {
        throw AppError.conflict("This purchase is linked to another account")
    }

    const expiresAt = lineItem.expiryTime || null
    const expiryInFuture = expiresAt && new Date(expiresAt).getTime() > Date.now()
    const state = purchase.subscriptionState
    let subscriptionStatus = "canceled"

    if (notificationType === 12) {
        subscriptionStatus = "canceled"
    } else if (ACCESS_STATES.has(state)) {
        subscriptionStatus = "active"
    } else if (state === "SUBSCRIPTION_STATE_CANCELED" && expiryInFuture) {
        subscriptionStatus = "active"
    } else if (state === "SUBSCRIPTION_STATE_PAUSED" || state === "SUBSCRIPTION_STATE_ON_HOLD") {
        subscriptionStatus = "paused"
    } else if (state === "SUBSCRIPTION_STATE_PENDING") {
        subscriptionStatus = "pending"
    }

    const storeStatus = notificationType === 12
        ? "SUBSCRIPTION_STATE_EXPIRED"
        : (state || "SUBSCRIPTION_STATE_UNSPECIFIED")

    const acknowledge = purchase.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING"
        && notificationType !== 12
        && state !== "SUBSCRIPTION_STATE_PENDING"
        && state !== "SUBSCRIPTION_STATE_EXPIRED"
        && state !== "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED"

    return {
        subscription_id: null,
        customer_id: `google:${entityUuid}`,
        subscription_tier: plan.tier,
        subscription_status: subscriptionStatus,
        interval: plan.interval,
        occurred_at: occurredAt,
        billing_provider: "google",
        purchase_token: null,
        product_id: lineItem.productId,
        expires_at: expiresAt,
        store_status: storeStatus,
        acknowledge
    }
}

export function sameGoogleSnapshot(existing, record) {
    if (!existing || existing.billing_provider !== "google") return false

    const existingExpiry = existing.expires_at ? new Date(existing.expires_at).toISOString() : null
    const recordExpiry = record.expires_at ? new Date(record.expires_at).toISOString() : null

    return existing.purchase_token === record.purchase_token
        && existing.subscription_tier === record.subscription_tier
        && existing.subscription_status === record.subscription_status
        && existing.interval === record.interval
        && existing.store_status === record.store_status
        && existingExpiry === recordExpiry
}

export function canReplaceExistingSubscription(existing, purchaseToken, linkedPurchaseToken) {
    if (!existing || !existing.subscription_id) return true
    if (!subscriptionInForce(existing)) return true

    if (existing.billing_provider === "google" && existing.purchase_token === purchaseToken) return true

    if (
        existing.billing_provider === "google"
        && linkedPurchaseToken
        && existing.purchase_token === linkedPurchaseToken
    ) {
        return true
    }

    return false
}

export function assertPaddleSubscription(customer) {
    if (customer.billing_provider === "google") {
        throw AppError.conflict("This subscription is managed in Google Play.")
    }
}

export function googlePlayManageUrl(productId) {
    const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME

    if (packageName && productId) {
        const params = new URLSearchParams({
            sku: productId,
            package: packageName
        })

        return `https://play.google.com/store/account/subscriptions?${params}`
    }

    return "https://play.google.com/store/account/subscriptions"
}

export function toPaddleShapedView(customer) {
    const scheduledCancel = customer.store_status === "SUBSCRIPTION_STATE_CANCELED" && customer.expires_at
        ? {
            action: "cancel",
            effective_at: customer.expires_at
        }
        : null

    return {
        billing_provider: "google",
        status: customer.subscription_status,
        items: [{
            product: { name: customer.subscription_tier }
        }],
        billing_cycle: { interval: customer.interval },
        next_billed_at: scheduledCancel ? null : customer.expires_at,
        scheduled_change: scheduledCancel,
        manage_url: googlePlayManageUrl(customer.product_id)
    }
}
