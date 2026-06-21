import express from "express"
import webhooksController from "../controllers/webhooks.js"
import { webhooksRateLimiter } from "../middleware/rateLimiter.js"
import { allowIPWebhook } from "../middleware/allowIP.js"
import { paddleUnmarshal } from "../middleware/paddleUnmarshal.js"

const webhooksRouter = express.Router()

webhooksRouter.post("/",
    express.raw({type: "application/json"}),
    allowIPWebhook,
    webhooksRateLimiter,
    paddleUnmarshal,
    webhooksController.handler
)

export default webhooksRouter
