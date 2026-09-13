import { StatusCodes } from "http-status-codes"
import customerService from "../service/customer.js"
import userService from "../service/user.js"
import { logger } from "../utils/logger.js"

async function dashboard(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`[Auth Me] Getting all customer/user info for user: ${id} device: ${device}`)

    const customerInfo = await customerService.getAllCustomerInfo(id)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: customerInfo.message,
        data: [{
            email: customerInfo.data[0]["email"],
            subscription_tier: customerInfo.data[0]["subscription_tier"],
            subscription_status: customerInfo.data[0]["subscription_status"],
            is_free_trial_used: customerInfo.data[0]["is_free_trial_used"],
            uuid: customerInfo.data[0]["entity_uuid"]
        }]
    })
}

async function profile(req, res, next) {
    const { id, device } = req.session.user

    logger.info(`Getting profile info for user: ${id} device: ${device}`)

    const profile = await userService.getProfile(id)

    return res.status(StatusCodes.OK).json({
        status: "success",
        message: "Profile data",
        data: profile.data
    })
}

export default { 
    dashboard: dashboard,
    profile: profile
}