import express from "express"
import livenessController from "../controllers/liveness.js"

const livenessRouter = express.Router()

livenessRouter.get("/health", livenessController.health)

livenessRouter.get("/ready", livenessController.ready)

export default livenessRouter
