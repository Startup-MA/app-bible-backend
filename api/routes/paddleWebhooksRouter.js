import express from "express"
import paddleWebhooksController from "../controllers/paddleWebhooks.js"
import { publicPaddleWebhooksRateLimiter } from "../middleware/publicIPRateLimiter.js"
import { allowPaddleIPWebhook } from "../middleware/allowPaddleIP.js"
import { paddleUnmarshal } from "../middleware/paddleUnmarshal.js"

const paddleWebhooksRouter = express.Router()

paddleWebhooksRouter.post("/",
    publicPaddleWebhooksRateLimiter,
    express.raw({type: "application/json"}),
    allowPaddleIPWebhook,
    paddleUnmarshal,
    paddleWebhooksController.handler
)

export default paddleWebhooksRouter
