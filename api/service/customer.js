import customerDAO from "../dao/customer.js"
import userDAO from "../dao/user.js"
import AppError from "../errors/AppError.js"
import ApiGateway from "../outboundAPI/ApiGateway.js"
import { logger } from "../utils/logger.js"

async function customerUpdate(data) {
    if (!data.data.customData || !data.data.customData.email) {
        throw AppError.bad_request("Custom data absence")
    }

    const user = await userDAO.findUserByEmail(data.data.customData.email)

    if (!user.length) {
        throw AppError.conflict("There is no user with such email")
    }
    
    const customer = await customerDAO.findCustomerById(data.data.customerId)

    if (!customer.length) {
        await customerDAO.addNewCustomer(data, user[0]["id_user"])
        
        logger.info("New customer successfully added!")

        return { 
            message: "New customer successfully added!",
            data: user
        }
    }
    
    if (
        customer[0]["subscription_id"] === data.data.id &&
        customer[0]["subscription_tier"] === data.data.items[0].product.name &&
        customer[0]["subscription_status"] === data.data.status &&
        customer[0]["interval"] === data.data.items[0].price.billingCycle.interval
    ) {
        logger.warn("Customer data is the same. No update")

        return {
            message: "Customer data is the same. No update",
            data: customer
        }
    }
    
    await customerDAO.updateCustomer(data, user[0]["id_user"])

    logger.info("Customer successfully updated!")

    return {
        message: "Customer successfully updated!",
        data: customer
    }
}

async function getAllCustomerInfo(id_user) {
    const customerInfo = await customerDAO.getAllCustomerInfoById(id_user)

    if (!customerInfo.length) {
        throw AppError.conflict("No user with such id")
    }

    return {
        message: "Customer info",
        data: customerInfo
    }
}

async function getSubscription(subscription_id) {
    const result = await ApiGateway.paddle.getSubscription(subscription_id)
    
    return {
        message: "Subscritpion data",
        data: result
    }
}

async function getCurrentPaymentMethod(subscription_id, customer_id) {
    const result = await ApiGateway.paddle.getCurrentPaymentMethod(subscription_id, customer_id)
    
    return {
        message: "Payment method was found successfully",
        data: result
    }
}

async function getLastYearTransactions(subscription_id, customer_id) {
    const result = await ApiGateway.paddle.getLastYearTransactions(subscription_id, customer_id)

    return {
        message: "Transactions list was retrieved successfully",
        data: result
    }

}

async function cancelSubscription(subscription_id) {
    const result = await ApiGateway.paddle.cancelSubscription(subscription_id,)

    return {
        message: "Subscription was canceled successfully",
        data: result
    }
}

async function cancelScheduledCancel(subscription_id) {
    const result = await ApiGateway.paddle.cancelScheduledCancel(subscription_id)

    return {
        message: "Subscription scheduled cancel was canceled successfully",
        data: result
    }
}

async function getUpdatePaymentMethodTransaction(subscription_id) {
    const result = await ApiGateway.paddle.getUpdatePaymentMethodTransaction(subscription_id)

    return {
        message: "Update payment method transaction was retrieved successfully",
        data: result
    }
}

async function upgradePlan(subscription_id, data) {
    const result = await ApiGateway.paddle.upgradePlan(subscription_id, data)

    return {
        message: "Subscription plan was upgraded successfully",
        data: result
    }
}

export default {
    customerUpdate: customerUpdate,
    getAllCustomerInfo: getAllCustomerInfo,
    getSubscription: getSubscription,
    getCurrentPaymentMethod: getCurrentPaymentMethod,
    getLastYearTransactions: getLastYearTransactions,
    cancelSubscription: cancelSubscription,
    cancelScheduledCancel: cancelScheduledCancel,
    getUpdatePaymentMethodTransaction: getUpdatePaymentMethodTransaction,
    upgradePlan: upgradePlan
}


// return {
//             success: 1,
//             message: "",
//             data: {
//   "id": "sub_01kmg0akrj19c0748tm93xvvrn",
//   "items": [
//   {
//     "price": {
//       "id": "pri_01kkys314de4bmqgkry01740nq",
//       "name": "Monthly Subscription",
//       "type": "standard",
//       "status": "active",
//       "quantity": {
//         "maximum": 1,
//         "minimum": 1
//       },
//       "tax_mode": "external",
//       "created_at": "2026-03-17T20:51:38.253294Z",
//       "product_id": "pro_01kkyrwmqtykq8anvwvjj5czmk",
//       "unit_price": {
//         "amount": "1000",
//         "currency_code": "USD"
//       },
//       "updated_at": "2026-03-17T20:51:38.253294Z",
//       "custom_data": null,
//       "description": "Monthly Subscription",
//       "import_meta": null,
//       "trial_period": null,
//       "billing_cycle": {
//         "interval": "month",
//         "frequency": 1
//       },
//       "unit_price_overrides": []
//     },
//     "status": "active",
//     "product": {
//       "id": "pro_01kkyrwmqtykq8anvwvjj5czmk",
//       "name": "Advanced",
//       "type": "standard",
//       "status": "active",
//       "image_url": null,
//       "created_at": "2026-03-17T20:48:08.954Z",
//       "updated_at": "2026-03-17T20:48:08.954Z",
//       "custom_data": null,
//       "description": "Verse and Prays",
//       "tax_category": "standard"
//     },
//     "quantity": 1,
//     "recurring": true,
//     "created_at": "2026-03-28T09:33:33.687Z",
//     "updated_at": "2026-03-31T13:44:41.798Z",
//     "trial_dates": null,
//     "next_billed_at": null,
//     "previously_billed_at": "2026-03-31T13:44:36.472Z"
//   }
// ],
//   "status": "past_due",
//   "discount": null,
//   "paused_at": null,
//   "address_id": "add_01hv8gq3318ktkfengj2r75gfx",
//   "created_at": "2024-04-12T10:18:48.831Z",
//   "started_at": "2024-04-12T10:18:47.635628Z",
//   "updated_at": "2024-05-12T10:19:26.014628Z",
//   "business_id": null,
//   "canceled_at": null,
//   "custom_data": {
//       "email": "varepaken2003@gmail.com"
//   },
//   "customer_id": "ctm_01k8xsd1y2zrwz24y19gkaf4ev ",
//   "import_meta": null,
//   "billing_cycle": {
//     "interval": "month",
//     "frequency": 1
//   },
//   "currency_code": "USD",
//   "next_billed_at": "2024-06-12T10:18:47.635628Z",
//   "billing_details": null,
//   "collection_mode": "automatic",
//   "first_billed_at": "2024-04-12T10:18:47.635628Z",
//   "scheduled_change": null,
//   "consent_requirements": [],
//   "current_billing_period": {
//     "ends_at": "2024-06-12T10:18:47.635628Z",
//     "starts_at": "2024-05-12T10:18:47.635628Z"
//   }