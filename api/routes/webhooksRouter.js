import express from "express"
import webhooksController from "../controllers/webhooks.js"
import { publicWebhooksRateLimiter } from "../middleware/publicIPRateLimiter.js"
import { allowIPWebhook } from "../middleware/allowIP.js"
import { paddleUnmarshal } from "../middleware/paddleUnmarshal.js"

const webhooksRouter = express.Router()

webhooksRouter.post("/",
    publicWebhooksRateLimiter,
    express.raw({type: "application/json"}),
    allowIPWebhook,
    paddleUnmarshal,
    webhooksController.handler
)

export default webhooksRouter
