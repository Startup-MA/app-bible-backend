import express from "express"
import authController from "../controllers/auth.js"
import validate from "../middleware/validation.js"
import authenticate from "../middleware/authenticate.js"
import { registerSchema, loginSchema, resetCodeSchema, verifyUserUUIDSchema, verifyUserCodeSchema, userHiddenEmailVerifySchema, userHiddenEmailVerifyCodeSchema } from "../validation/schemas/user.schema.js"
import { 
    publicRegisterRateLimiter,
    publicLoginRateLimiter,
    publicGoogleAuthRateLimiter,
    publicAppleAuthRateLimiter,
    publicHiddenEmailVerifyRateLimiter,
    publicHiddenEmailCodeVerifyRateLimiter,
    publicHiddenEmailCodeResetRateLimiter,
    publicVerifyCodeRateLimiter,
    publicResetCodeRateLimiter,
    publicLogoutRateLimiter
} from "../middleware/publicIPRateLimiter.js"
import { 
    userRegisterRateLimiter,
    userLoginRateLimiter,
    userHiddenEmailVerifyRateLimiter,
    userHiddenEmailCodeVerifyRateLimiter,
    userHiddenEmailCodeResetRateLimiter,
    userResetCodeRateLimiter,
    userLogoutRateLimiter
} from "../middleware/userSpecificRateLimiter.js"

const authRouter = express.Router()

authRouter.post("/registration",
    publicRegisterRateLimiter,
    validate(registerSchema, "body"),
    userRegisterRateLimiter,
    authController.registration
)

authRouter.post("/login", 
    publicLoginRateLimiter,
    validate(loginSchema, "body"),
    userLoginRateLimiter,
    authController.login
)

authRouter.get("/google",
    publicGoogleAuthRateLimiter,
    authController.googleAuth
)

authRouter.post("/apple",
    publicAppleAuthRateLimiter,
    authController.appleAuth
)

authRouter.post("/apple/callback",
    publicAppleAuthRateLimiter,
    authController.appleCallback
)

authRouter.post("/hiddenEmailVerify/:uuid",
    publicHiddenEmailVerifyRateLimiter,
    validate(verifyUserUUIDSchema, "params"),
    validate(userHiddenEmailVerifySchema, "body"),
    userHiddenEmailVerifyRateLimiter,
    authController.hiddenEmailVerify
)

authRouter.post("/hiddenEmailCodeVerify/:uuid",
    publicHiddenEmailCodeVerifyRateLimiter,
    validate(verifyUserUUIDSchema, "params"),
    validate(userHiddenEmailVerifyCodeSchema, "body"),
    userHiddenEmailCodeVerifyRateLimiter,
    authController.hiddenEmailCodeVerify
)

authRouter.post("/hiddenEmailCodeReset/:uuid",
    publicHiddenEmailCodeResetRateLimiter,
    validate(verifyUserUUIDSchema, "params"),
    validate(userHiddenEmailVerifySchema, "body"),
    userHiddenEmailCodeResetRateLimiter,
    authController.hiddenEmailCodeReset
)

authRouter.post("/verifyCode",
    publicVerifyCodeRateLimiter,
    validate(verifyUserCodeSchema, "body"),
    authController.verifyCode
)

authRouter.post("/resetCode",
    publicResetCodeRateLimiter,
    validate(resetCodeSchema, "body"),
    userResetCodeRateLimiter,
    authController.resetCode
)

authRouter.get("/logout", publicLogoutRateLimiter, authenticate.session, userLogoutRateLimiter, authController.logout)

export default authRouter
