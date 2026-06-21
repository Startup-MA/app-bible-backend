import express from "express"
import validate from "../middleware/validation.js"
import customerController from "../controllers/customer.js"
import authenticate from "../middleware/authenticate.js"
import { cache } from "../middleware/cache.js"
import { 
    getSubscriptionRateLimiter, 
    getCurrentPaymentMethodRateLimiter,
    getLastYearTransactionsRateLimiter,
    cancelSubscriptionRateLimiter,
    cancelScheduledCancelRateLimiter,
    getUpdatePaymentMethodTransactionRateLimiter,
    upgradePlanRateLimiter
} from "../middleware/rateLimiter.js"

import { upgradePlanSchema } from "../validation/schemas/upgradePlan.schema.js"

const customerRouter = express.Router()

customerRouter.use(authenticate.session)

customerRouter.get("/getSubscription",
    cache(600, (req) => `paddle:${req.session.user.id}:${req.originalUrl}`),
    getSubscriptionRateLimiter,
    customerController.getSubscription
)

customerRouter.get("/getCurrentPaymentMethod",
    cache(600, (req) => `paddle:${req.session.user.id}:${req.originalUrl}`),
    getCurrentPaymentMethodRateLimiter,
    customerController.getCurrentPaymentMethod
)

customerRouter.get("/getLastYearTransactions",
    cache(600, (req) => `paddle:${req.session.user.id}:${req.originalUrl}`),
    getLastYearTransactionsRateLimiter,
    customerController.getLastYearTransactions
)

customerRouter.post("/cancelSubscription",
    cancelSubscriptionRateLimiter,
    customerController.cancelSubscription
)

customerRouter.post("/cancelScheduledCancel",
    cancelScheduledCancelRateLimiter,
    customerController.cancelScheduledCancel
)

customerRouter.get("/getUpdatePaymentMethodTransaction",
    getUpdatePaymentMethodTransactionRateLimiter,
    customerController.getUpdatePaymentMethodTransaction
)

customerRouter.patch("/upgradePlan",
    validate(upgradePlanSchema, "body"),
    upgradePlanRateLimiter,
    customerController.upgradePlan
)

export default customerRouter