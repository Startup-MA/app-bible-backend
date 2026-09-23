import { rateLimit } from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"
import redisClient from "../connections/redis.js"

const { Cache } = redisClient

// Auth

export const publicRegisterRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
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
    limit: 30,
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
    limit: 30,
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
    limit: 30,
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
    limit: 30,
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
    limit: 30,
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
    limit: 30,
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
    limit: 30,
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
    limit: 30,
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
    windowMs: 60 * 1000,
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

// Webhook

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

// liveness

export const publicHealthRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:health:"
    })
})

export const publicReadyRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:ready:"
    })
})

// Pass

export const publicForgotRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:forgot:"
    })
})

export const publicResetRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:reset:"
    })
})

// Dashboard

export const publicAuthMeRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:authMe:"
    })
})

export const publicProfileRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:profile:"
    })
})

// Sys

export const publicNeedToUpdateRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:needToUpdate:"
    })
})

export const publicUpdateAppVersionRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:updateAppVersion:"
    })
})

export const publicGetCurrentAppVersionRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getCurrentAppVersion:"
    })
})

export const publicGetAllBibleTextVersionsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getAllBibleTextVersions:"
    })
})

export const publicGetBibleTextVersionsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getBibleTextVersions:"
    })
})

export const publicGetAllLangsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getAllLangs:"
    })
})

export const publicCreateTicketRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:createTicket:"
    })
})

export const publicDeleteTicketsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:deleteTickets:"
    })
})

export const publicGetTicketsPerPageRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getTicketsPerPage:"
    })
})

export const publicGetTicketsCountRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getTicketsCount:"
    })
})

// User

export const publicSkipPersonalInfoRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:skipPersonalInfo:"
    })
})

export const publicUpdateProfileRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:updateProfile:"
    })
})

export const publicDeleteAccountRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:deleteAccount:"
    })
})

// Verses Prayers generation

export const publicCreateOrUpdateUserTopicsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:createOrUpdateUserTopics:"
    })
})

export const publicGetUserTopicsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserTopics:"
    })
})

export const publicGenerateDailyVersePrayerRateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 100,
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

export const publicGetUserDailyPrayerTranslationRateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserDailyPrayerTranslation:"
    })
})

export const publicGetUserDailyVersePrayerRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserDailyVersePrayer:"
    })
})

// User sync content

export const publicSyncBookmarksRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:syncBookmarks:"
    })
})

export const publicGetUserBookmarksRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserBookmarks:"
    })
})

export const publicSyncNotesRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:syncNotes:"
    })
})

export const publicGetUserNotesRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserNotes:"
    })
})

export const publicSyncUserReadingHistoryRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:syncUserReadingHistory:"
    })
})

export const publicGetUserReadingHistoryRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserReadingHistory:"
    })
})

export const publicSyncHighlightsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:syncHighlights:"
    })
})

export const publicGetUserHighlightsRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserHighlights:"
    })
})

export const publicSyncPrayersRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:syncPrayers:"
    })
})

export const publicGetUserPrayersRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUserPrayers:"
    })
})

// Customer

export const publicGetSubscriptionRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
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
    windowMs: 60 * 1000,
    limit: 100,
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
    windowMs: 60 * 1000,
    limit: 100,
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
    windowMs: 60 * 1000,
    limit: 30,
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
    windowMs: 60 * 1000,
    limit: 30,
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
    limit: 30,
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
    limit: 30,
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