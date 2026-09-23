import express from "express"
import dashboardController from "../controllers/dashboard.js"
import authenticate from "../middleware/authenticate.js"
import { publicAuthMeRateLimiter, publicProfileRateLimiter } from "../middleware/publicIPRateLimiter.js"
import { userAuthMeRateLimiter, userProfileRateLimiter } from "../middleware/userSpecificRateLimiter.js"

const dashboardRouter = express.Router()

dashboardRouter.get("/authMe", publicAuthMeRateLimiter, authenticate.session, userAuthMeRateLimiter, dashboardController.dashboard)
dashboardRouter.get("/profile", publicProfileRateLimiter, authenticate.session, userProfileRateLimiter, dashboardController.profile)

export default dashboardRouter