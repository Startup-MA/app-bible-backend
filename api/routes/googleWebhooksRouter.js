import express from "express"
import googleWebhooksController from "../controllers/googleWebhooks.js"
import { publicGoogleWebhooksRateLimiter } from "../middleware/publicIPRateLimiter.js"
import { googlePubSubAuth } from "../middleware/googlePubSubAuth.js"

const googleWebhooksRouter = express.Router()

googleWebhooksRouter.post("/",
    publicGoogleWebhooksRateLimiter,
    googlePubSubAuth,
    googleWebhooksController.handler
)

export default googleWebhooksRouter
