import express from "express"
import session from "./middleware/session.js"
import notFound from "./middleware/notFound.js"
import cors from "cors"

import authRouter from "./routes/authRouter.js"
import dashboardRouter from "./routes/dashboardRouter.js"
import passRouter from "./routes/passRouter.js"
import userRouter from "./routes/userRouter.js"
import sysRouter from "./routes/sysRouter.js"
import paddleWebhooksRouter from "./routes/paddleWebhooksRouter.js"
import googleWebhooksRouter from "./routes/googleWebhooksRouter.js"
import customerRouter from "./routes/customerRouter.js"
import livenessRouter from "./routes/livenessRouter.js"

import { errorHandler } from "./middleware/errorHandler.js"
import { morganMiddleware } from "./middleware/morgan.js"
import authenticate from "./middleware/authenticate.js"

import { swaggerSpec } from "./utils/swaggerSpec.js"
import swaggerUi from "swagger-ui-express"

const app = express()

// One hop: nginx in front of the process. Deployed dev keeps NODE_ENV=development,
// so this cannot follow NODE_ENV. Without it, express-rate-limit throws
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every proxied request.
app.set("trust proxy", 1)

app.use(cors({
    origin: process.env.FRONT_URL, // Specify the allowed origin
    methods: ["GET", "POST", "PATCH", "DELETE"], // Specify allowed HTTP methods
    allowedHeaders: ["Content-Type"], // Specify allowed headers
    credentials: true
}))

app.use(morganMiddleware)
app.use("/api/webhooks/paddle", paddleWebhooksRouter)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/webhooks/google", googleWebhooksRouter)

app.use(session)

app.use("/api/auth", authRouter)
app.use("/api/pass", passRouter)
app.use("/api/user", userRouter)
app.use("/api/customer", customerRouter)
app.use("/api/sys", sysRouter)
app.use("/api/docs",
    authenticate.session,
    authenticate.isAdmin,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
)
app.use("/api", dashboardRouter)

app.use("/liveness", livenessRouter)

app.use(notFound)

app.use(errorHandler)


export default app