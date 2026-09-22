import { rateLimit } from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"
import redisClient from "../connections/redis.js"

const { Cache } = redisClient

// Auth

export const publicRegisterRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:register:"
    })
})

export const publicLoginRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:login:"
    })
})

export const publicGoogleAuthRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:googleAuth:"
    })
})

export const publicAppleAuthRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:appleAuth:"
    })
})

export const publicHiddenEmailVerifyRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:hiddenEmailVerify:"
    })
})

export const publicHiddenEmailCodeVerifyRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:hiddenEmailCodeVerify:"
    })
})

export const publicHiddenEmailCodeResetRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:hiddenEmailCodeReset:"
    })
})

export const publicVerifyCodeRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:verifyCode:"
    })
})

export const publicResetCodeRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:resetCode:"
    })
})

export const publicLogoutRateLimiter = rateLimit({
    windowMs: 60000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:logout:"
    })
})

// Customer

export const publicWebhooksRateLimiter = rateLimit({
    windowMs: 1000,
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:webhook:"
    })
})

export const publicGetSubscriptionRateLimiter = rateLimit({
    windowMs: 60000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getSubscription:"
    })
})

export const publicGetCurrentPaymentMethodRateLimiter = rateLimit({
    windowMs: 60000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getCurrentPaymentMethod:"
    })
})

export const publicGetLastYearTransactionsRateLimiter = rateLimit({
    windowMs: 60000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getLastYearTransactions:"
    })
})

export const publicCancelSubscriptionRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:cancelSubscription:"
    })
})

export const publicCancelScheduledCancelRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:cancelScheduledCancel:"
    })
})

export const publicGetUpdatePaymentMethodTransactionRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUpdatePaymentMethodTransaction:"
    })
})

export const publicUpgradePlanRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 1,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:upgradePlan:"
    })
})

export const publicGenerateDailyVersePrayerRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 2,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:generateDailyVersePrayer:"
    })
})