import express from "express"
import webhooksController from "../controllers/webhooks.js"
import { publicWebhooksRateLimiter } from "../middleware/publicIPRateLimiter.js"
import { allowIPWebhook } from "../middleware/allowIP.js"
import { paddleUnmarshal } from "../middleware/paddleUnmarshal.js"

const webhooksRouter = express.Router()

webhooksRouter.post("/",
    express.raw({type: "application/json"}),
    allowIPWebhook,
    publicWebhooksRateLimiter,
    paddleUnmarshal,
    webhooksController.handler
)

export default webhooksRouter
