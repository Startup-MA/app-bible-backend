export function hasPremiumAccess(customerInfo) {
    const customer = customerInfo && customerInfo[0]

    if (!customer) return false

    return customer.subscription_tier === "Premium"
        && (customer.subscription_status === "active" || customer.subscription_status === "trialing")
}
