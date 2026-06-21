import { Paddle } from "@paddle/paddle-node-sdk"
import { StatusCodes } from "http-status-codes";
import { logger } from "../utils/logger.js"

const paddle = new Paddle(process.env.PADDLE_API_KEY)

export async function paddleUnmarshal(req, res, next) {
    const signature = (String(req.headers["paddle-signature"])) || "";
    
    // req.body should be of type `buffer`, convert to string before passing it to `unmarshal`. 
    // If express returned a JSON, remove any other middleware that might have processed raw request to object
    const rawRequestBody = req.body.toString();
    // Replace `WEBHOOK_SECRET_KEY` with the secret key in notifications from vendor dashboard
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET_KEY || "";
    
    try {
        if (signature && rawRequestBody) {
            // The `unmarshal` function will validate the integrity of the webhook and return an entity

            const eventData = await paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature);
            

            req["body"] = eventData

            return next()
            
        } else {
            return res.status(StatusCodes.FORBIDDEN).json({
                status: "error",
                messages: "Signature missing in header"
            })
        }
    } catch (err) {
        logger.error({stack: err.stack});

        return res.status(StatusCodes.BAD_REQUEST).json({
            status: "error",
            messages: "Invalid signature"
        })
    }
}