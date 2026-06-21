import express from "express"
import session from "./middleware/session.js"
import notFound from "./middleware/notFound.js"
import cors from "cors"

import authRouter from "./routes/authRouter.js"
import dashboardRouter from "./routes/dashboardRouter.js"
import passRouter from "./routes/passRouter.js"
import userRouter from "./routes/userRouter.js"
import sysRouter from "./routes/sysRouter.js"
import webhooksRouter from "./routes/webhooksRouter.js"
import customerRouter from "./routes/customerRouter.js"

 import { errorHandler } from "./middleware/errorHandler.js"
import { morganMiddleware } from "./middleware/morgan.js"

import { swaggerSpec } from "./utils/swaggerSpec.js"
import swaggerUi from "swagger-ui-express"

const app = express()
app.set("trust proxy", 1) // (Cloudflare) Inside Kubernetes Cluster when running behind nginx!!!

app.use(cors({
    origin: process.env.FRONT_URL, // Specify the allowed origin
    methods: ["GET", "POST", "PATCH", "DELETE"], // Specify allowed HTTP methods
    allowedHeaders: ["Content-Type"], // Specify allowed headers
    credentials: true
}))

app.set("view engine", "ejs")
app.use(morganMiddleware)
app.use("/api/webhooks", webhooksRouter)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session)
// app.use("/api/user", authenticate.session, authenticate.userMobile)
// app.use("/api/customer", authenticate.session)
// app.use(/api)
app.use("/api/auth", authRouter)
app.use("/api/pass", passRouter)
app.use("/api/user", userRouter)
app.use("/api/customer", customerRouter)
app.use("/api/sys", sysRouter)
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use("/api", dashboardRouter)

app.use(notFound)

app.use(errorHandler)


export default app