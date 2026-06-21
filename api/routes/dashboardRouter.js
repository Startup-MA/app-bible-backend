import express from "express"
import dashboardController from "../controllers/dashboard.js"
import authenticate from "../middleware/authenticate.js"

const dashboardRouter = express.Router()

dashboardRouter.get("/authMe", authenticate.session, dashboardController.dashboard)
dashboardRouter.get("/profile", authenticate.session, dashboardController.profile)

export default dashboardRouter