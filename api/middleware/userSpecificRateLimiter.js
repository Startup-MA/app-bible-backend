import { rateLimit } from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"
import redisClient from "../connections/redis.js"

const { Cache } = redisClient

// Auth

export const userRegisterRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:register:"
    }),
    keyGenerator: (req, res) => req.body.email
})

export const userLoginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:login:"
    }),
    keyGenerator: (req, res) => req.body.email
})

export const userHiddenEmailVerifyRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:hiddenEmailVerify:"
    }),
    keyGenerator: (req, res) => req.body.email
})

export const userHiddenEmailCodeVerifyRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:hiddenEmailCodeVerify:"
    }),
    keyGenerator: (req, res) => req.body.email
})

export const userHiddenEmailCodeResetRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:hiddenEmailCodeReset:"
    }),
    keyGenerator: (req, res) => req.body.email
})

export const userResetCodeRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:resetCode:"
    }),
    keyGenerator: (req, res) => req.body.email
})

export const userLogoutRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:logout:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

// Pass

export const userForgotRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:forgot:"
    }),
    keyGenerator: (req, res) => req.body.email
})

export const userResetRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:reset:"
    }),
    keyGenerator: (req, res) => req.params.uuid
})

// Dashboard

export const userAuthMeRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:authMe:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userProfileRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:profile:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

// Sys

export const userUpdateAppVersionRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:updateAppVersion:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetCurrentAppVersionRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getCurrentAppVersion:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userDeleteTicketsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:deleteTickets:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetTicketsPerPageRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getTicketsPerPage:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetTicketsCountRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getTicketsCount:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

// User

export const userSkipPersonalInfoRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:skipPersonalInfo:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userUpdateProfileRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:updateProfile:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userDeleteAccountRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:deleteAccount:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

// Verses Prayers generation

export const userCreateOrUpdateUserTopicsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:createOrUpdateUserTopics:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetUserTopicsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserTopics:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGenerateDailyVersePrayerRateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:generateDailyVersePrayer:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetUserDailyPrayerTranslationRateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 70,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserDailyPrayerTranslation:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetUserDailyVersePrayerRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserDailyVersePrayer:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

// User sync content

export const userSyncBookmarksRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:syncBookmarks:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetUserBookmarksRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserBookmarks:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userSyncNotesRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:syncNotes:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetUserNotesRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserNotes:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userSyncUserReadingHistoryRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:syncUserReadingHistory:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetUserReadingHistoryRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserReadingHistory:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userSyncHighlightsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:syncHighlights:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetUserHighlightsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserHighlights:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userSyncPrayersRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:syncPrayers:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetUserPrayersRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserPrayers:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})


// Customer

export const userGetSubscriptionRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getSubscription:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetCurrentPaymentMethodRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getCurrentPaymentMethod:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetLastYearTransactionsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getLastYearTransactions:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userCancelSubscriptionRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:cancelSubscription:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userCancelScheduledCancelRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:cancelScheduledCancel:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGetUpdatePaymentMethodTransactionRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUpdatePaymentMethodTransaction:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userGooglePurchaseRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:googlePurchase:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})

export const userUpgradePlanRateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "The maximum number of attempts was reached"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:upgradePlan:"
    }),
    keyGenerator: (req, res) => req.session.user.id
})