import session from "express-session"
import { RedisStore } from "connect-redis"
import redisClient from "../connections/redis.js"
import dotenv from "dotenv"

dotenv.config()

const { Cache } = redisClient

export default session({
    store: new RedisStore({client: Cache }),
    secret: process.env.REDIS_SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    name: "sessionId",
    cookie: {
        sameSite: process.env.NODE_ENV ? "none" : false,
        // sameSite: "none",
        secure: process.env.NODE_ENV === "production" ? true : false,
        // secure: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 120 // ms
    }
})