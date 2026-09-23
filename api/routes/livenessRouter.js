import express from "express"
import livenessController from "../controllers/liveness.js"
import { publicHealthRateLimiter, publicReadyRateLimiter } from "../middleware/publicIPRateLimiter.js"

const livenessRouter = express.Router()

livenessRouter.get("/health", publicHealthRateLimiter, livenessController.health)

livenessRouter.get("/ready", publicReadyRateLimiter, livenessController.ready)

export default livenessRouter
