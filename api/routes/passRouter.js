import express from "express"
import passController from "../controllers/pass.js"
import validate from "../middleware/validation.js"
import { forgotSchema, verifyUserUUIDSchema, setNewPassSchema } from "../validation/schemas/user.schema.js"
import { publicForgotRateLimiter, publicResetRateLimiter } from "../middleware/publicIPRateLimiter.js"
import { userForgotRateLimiter, userResetRateLimiter } from "../middleware/userSpecificRateLimiter.js"

const passRouter = express.Router()

passRouter.post("/forgot",
    publicForgotRateLimiter,
    validate(forgotSchema, "body"),
    userForgotRateLimiter,
    passController.forgot)

passRouter.post("/reset/:uuid",
    publicResetRateLimiter,
    validate(verifyUserUUIDSchema, "params"),
    validate(setNewPassSchema, "body"),
    userResetRateLimiter,
    passController.reset
)

export default passRouter