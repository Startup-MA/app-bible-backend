import express from "express"
import dashboardController from "../controllers/dashboard.js"
import authenticate from "../middleware/authenticate.js"
import { publicAuthMeRateLimiter, publicProfileRateLimiter } from "../middleware/publicIPRateLimiter.js"
import { userAuthMeRateLimiter, userProfileRateLimiter } from "../middleware/userSpecificRateLimiter.js"
import { cache } from "../middleware/cache.js"

const dashboardRouter = express.Router()

dashboardRouter.get("/authMe", 
    publicAuthMeRateLimiter,
    authenticate.session,
    cache(600, (req) => `dashboard:${req.session.user.id}:${req.originalUrl}`),
    userAuthMeRateLimiter,
    dashboardController.dashboard
)
dashboardRouter.get("/profile",
    publicProfileRateLimiter,
    authenticate.session,
    cache(600, (req) => `dashboard:${req.session.user.id}:${req.originalUrl}`),
    userProfileRateLimiter,
    dashboardController.profile
)

export default dashboardRouter