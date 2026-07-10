import { rateLimit } from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"
import redisClient from "../connections/redis.js"

const { Cache } = redisClient

export const loginRateLimiter = rateLimit({
    windowMs: 1000,
    limit: 1,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:login:"
    }),
    // keyGenerator: (req) => {
    //     return req.headers['cf-connecting-ip'] || req.ip;
    // },
    // requestIp: (req) => req.ip
})

export const resetCodeRateLimiter = rateLimit({
    windowMs: 30000,
    limit: 1,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:resetCode:"
    }),
    // keyGenerator: (req) => {
    //     return req.headers['cf-connecting-ip'] || req.ip;
    // },
    // requestIp: (req) => req.ip

})

export const webhooksRateLimiter = rateLimit({
    windowMs: 1000,
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:webhook:"
    }),
    // keyGenerator: (req) => {
    //     return req.headers['cf-connecting-ip'] || req.ip;
    // },
    // requestIp: (req) => req.ip

})

export const getSubscriptionRateLimiter = rateLimit({
    windowMs: 60000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getSubscription:"
    }),
    // keyGenerator: (req) => {
    //     return req.headers['cf-connecting-ip'] || req.ip;
    // },
    // requestIp: (req) => req.ip
})

export const getCurrentPaymentMethodRateLimiter = rateLimit({
    windowMs: 60000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getCurrentPaymentMethod:"
    }),
    // keyGenerator: (req) => {
    //     return req.headers['cf-connecting-ip'] || req.ip;
    // },
    // requestIp: (req) => req.ip
})

export const getLastYearTransactionsRateLimiter = rateLimit({
    windowMs: 60000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getLastYearTransactions:"
    }),
    // keyGenerator: (req) => {
    //     return req.headers['cf-connecting-ip'] || req.ip;
    // },
    // requestIp: (req) => req.ip
})

export const cancelSubscriptionRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:cancelSubscription:"
    }),
    // keyGenerator: (req) => {
    //     return req.headers['cf-connecting-ip'] || req.ip;
    // },
    // requestIp: (req) => req.ip
})

export const cancelScheduledCancelRateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:cancelScheduledCancel:"
    }),
    // keyGenerator: (req) => {
    //     return req.headers['cf-connecting-ip'] || req.ip;
    // },
    // requestIp: (req) => req.ip
})

export const getUpdatePaymentMethodTransactionRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:getUpdatePaymentMethodTransaction:"
    }),
    // keyGenerator: (req) => {
    //     return req.headers['cf-connecting-ip'] || req.ip;
    // }
})

export const upgradePlanRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 1,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests"
    },
    store: new RedisStore({
        sendCommand: (...args) => Cache.sendCommand(args),
        prefix: "rl:upgradePlan:"
    }),
    // keyGenerator: (req) => {
    //     return req.headers['cf-connecting-ip'] || req.ip;
    // }
})