import express from "express"
import authController from "../controllers/auth.js"
import validate from "../middleware/validation.js"
import authenticate from "../middleware/authenticate.js"
import { registerSchema, loginSchema, resetCodeSchema, verifyUserUUIDSchema, verifyUserCodeSchema, userHiddenEmailVerifySchema, userHiddenEmailVerifyCodeSchema } from "../validation/schemas/user.schema.js"
import { loginRateLimiter, resetCodeRateLimiter } from "../middleware/rateLimiter.js"

const authRouter = express.Router()

authRouter.post("/registration",
    validate(registerSchema, "body"),
    authController.registration
)

authRouter.post("/login", 
    loginRateLimiter,
    validate(loginSchema, "body"),
    authController.login
)

authRouter.get("/google", 
    authController.googleAuth
)

authRouter.post("/apple", 
    authController.appleAuth
)

authRouter.post("/hiddenEmailVerify/:uuid",
    validate(verifyUserUUIDSchema, "params"),
    validate(userHiddenEmailVerifySchema, "body"),
    authController.hiddenEmailVerify
)

authRouter.post("/hiddenEmailCodeVerify/:uuid", 
    validate(verifyUserUUIDSchema, "params"),
    validate(userHiddenEmailVerifyCodeSchema, "body"),
    authController.hiddenEmailCodeVerify
)

authRouter.post("/hiddenEmailCodeReset/:uuid",
    validate(verifyUserUUIDSchema, "params"),
    validate(userHiddenEmailVerifySchema, "body"),
    authController.hiddenEmailCodeReset
)

authRouter.post("/verifyCode",
    validate(verifyUserCodeSchema, "body"),
    authController.verifyCode
)

authRouter.post("/resetCode",
    resetCodeRateLimiter,
    validate(resetCodeSchema, "body"),
    authController.resetCode
)

authRouter.get("/logout", authenticate.session, authController.logout)

export default authRouter
