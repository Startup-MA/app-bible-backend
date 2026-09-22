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

import { upgradePlanSchema } from "../validation/schemas/upgradePlan.schema.js"

const customerRouter = express.Router()

customerRouter.use(authenticate.session)

customerRouter.get("/getSubscription",
    cache(600, (req) => `paddle:${req.session.user.id}:${req.originalUrl}`),
    publicGetSubscriptionRateLimiter,
    customerController.getSubscription
)

customerRouter.get("/getCurrentPaymentMethod",
    cache(600, (req) => `paddle:${req.session.user.id}:${req.originalUrl}`),
    publicGetCurrentPaymentMethodRateLimiter,
    customerController.getCurrentPaymentMethod
)

customerRouter.get("/getLastYearTransactions",
    cache(600, (req) => `paddle:${req.session.user.id}:${req.originalUrl}`),
    publicGetLastYearTransactionsRateLimiter,
    customerController.getLastYearTransactions
)

customerRouter.post("/cancelSubscription",
    publicCancelSubscriptionRateLimiter,
    customerController.cancelSubscription
)

customerRouter.post("/cancelScheduledCancel",
    publicCancelScheduledCancelRateLimiter,
    customerController.cancelScheduledCancel
)

customerRouter.get("/getUpdatePaymentMethodTransaction",
    publicGetUpdatePaymentMethodTransactionRateLimiter,
    customerController.getUpdatePaymentMethodTransaction
)

customerRouter.patch("/upgradePlan",
    validate(upgradePlanSchema, "body"),
    publicUpgradePlanRateLimiter,
    customerController.upgradePlan
)

export default customerRouter