import { rateLimit } from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"
import redisClient from "../connections/redis.js"

const { Cache } = redisClient

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