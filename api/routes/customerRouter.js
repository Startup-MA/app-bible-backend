import express from "express"
import validate from "../middleware/validation.js"
import customerController from "../controllers/customer.js"
import authenticate from "../middleware/authenticate.js"
import { cache } from "../middleware/cache.js"
import { 
    publicGetSubscriptionRateLimiter, 
    publicGetCurrentPaymentMethodRateLimiter,
    publicGetLastYearTransactionsRateLimiter,
    publicCancelSubscriptionRateLimiter,
    publicCancelScheduledCancelRateLimiter,
    publicGetUpdatePaymentMethodTransactionRateLimiter,
    publicUpgradePlanRateLimiter
} from "../middleware/publicIPRateLimiter.js"
import {
    userGetSubscriptionRateLimiter, 
    userGetCurrentPaymentMethodRateLimiter,
    userGetLastYearTransactionsRateLimiter,
    userCancelSubscriptionRateLimiter,
    userCancelScheduledCancelRateLimiter,
    userGetUpdatePaymentMethodTransactionRateLimiter,
    userUpgradePlanRateLimiter
} from "../middleware/userSpecificRateLimiter.js"
import { upgradePlanSchema } from "../validation/schemas/upgradePlan.schema.js"

const customerRouter = express.Router()

customerRouter.get("/getSubscription",
    publicGetSubscriptionRateLimiter,
    authenticate.session,
    cache(600, (req) => `paddle:${req.session.user.id}:${req.originalUrl}`),
    userGetSubscriptionRateLimiter, 
    customerController.getSubscription
)

customerRouter.get("/getCurrentPaymentMethod",
    publicGetCurrentPaymentMethodRateLimiter,
    authenticate.session,
    cache(600, (req) => `paddle:${req.session.user.id}:${req.originalUrl}`),
    userGetCurrentPaymentMethodRateLimiter,
    customerController.getCurrentPaymentMethod
)

customerRouter.get("/getLastYearTransactions",
    publicGetLastYearTransactionsRateLimiter,
    authenticate.session,
    cache(600, (req) => `paddle:${req.session.user.id}:${req.originalUrl}`),
    userGetLastYearTransactionsRateLimiter,
    customerController.getLastYearTransactions
)

customerRouter.post("/cancelSubscription",
    publicCancelSubscriptionRateLimiter,
    authenticate.session,
    userCancelSubscriptionRateLimiter,
    customerController.cancelSubscription
)

customerRouter.post("/cancelScheduledCancel",
    publicCancelScheduledCancelRateLimiter,
    authenticate.session,
    userCancelScheduledCancelRateLimiter,
    customerController.cancelScheduledCancel
)

customerRouter.get("/getUpdatePaymentMethodTransaction",
    publicGetUpdatePaymentMethodTransactionRateLimiter,
    authenticate.session,
    userGetUpdatePaymentMethodTransactionRateLimiter,
    customerController.getUpdatePaymentMethodTransaction
)

customerRouter.patch("/upgradePlan",
    publicUpgradePlanRateLimiter,
    authenticate.session,
    validate(upgradePlanSchema, "body"),
    userUpgradePlanRateLimiter,
    customerController.upgradePlan
)

export default customerRouter