import { GoogleAuth } from "google-auth-library"
import BaseApiClient from "./BaseApiClient.js"
import AppError from "../errors/AppError.js"
import { logger } from "../utils/logger.js"

class GooglePlayService extends BaseApiClient {
    constructor() {
        super({
            baseURL: "https://androidpublisher.googleapis.com/androidpublisher/v3",
            timeout: 10000,
            rateLimit: {
                keyPrefix: "limit:google-play",
                points: 60,
                duration: 60
            }
        })

        this.auth = null
    }

    packageName() {
        const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME

        if (!packageName) {
            logger.error("GOOGLE_PLAY_PACKAGE_NAME is not set")
            throw AppError.bad_gateway("API Service Error")
        }

        return packageName
    }

    async authorizationHeader() {
        if (!process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_FILE) {
            logger.error("GOOGLE_PLAY_SERVICE_ACCOUNT_FILE is not set")
            throw AppError.bad_gateway("API Service Error")
        }

        if (!this.auth) {
            this.auth = new GoogleAuth({
                keyFile: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_FILE,
                scopes: ["https://www.googleapis.com/auth/androidpublisher"]
            })
        }

        const client = await this.auth.getClient()
        const accessToken = await client.getAccessToken()
        const token = typeof accessToken === "string" ? accessToken : accessToken && accessToken.token

        if (!token) {
            logger.error("Google Play authorization did not return an access token")
            throw AppError.bad_gateway("API Service Error")
        }

        return { Authorization: `Bearer ${token}` }
    }

    getSubscription(purchaseToken) {
        return this.authorizationHeader().then((headers) => this.request({
            method: "GET",
            url: `/applications/${this.packageName()}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`,
            headers
        }))
    }

    async acknowledge(subscriptionId, purchaseToken) {
        try {
            const headers = await this.authorizationHeader()

            await this.request({
                method: "POST",
                url: `/applications/${this.packageName()}/purchases/subscriptions/${encodeURIComponent(subscriptionId)}:acknowledge`,
                params: { token: purchaseToken },
                data: {},
                headers
            })
        } catch (err) {
            if (err.statusCode === 400 && /acknowledg/i.test(err.googleMessage || "")) {
                logger.warn("Google Play purchase was already acknowledged")
                return
            }

            throw err
        }
    }

    handleError(error, url) {
        if (error.response) {
            const reason = (error.response.data && error.response.data.error && error.response.data.error.message) || ""

            logger.error(`[API Error] ${url} returned ${error.response.status}: ${JSON.stringify(error.response.data)}`)

            if (error.response.status === 400 || error.response.status === 404) {
                const appError = AppError.bad_request("Google Play purchase was not found")
                appError.googleMessage = reason
                throw appError
            }

            throw AppError.bad_gateway("API Service Error")
        } else if (error.request) {
            logger.error(`[API Network Error] No response received from ${url}`)
            throw AppError.bad_gateway("API Service Error")
        } else {
            logger.error(`API Configuration Error: ${error.message}`)
            throw AppError.bad_gateway("API Service Error")
        }
    }
}

export default GooglePlayService
