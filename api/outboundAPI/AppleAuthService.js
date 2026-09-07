import BaseApiClient from "./BaseApiClient.js"
import { generateAppleClientSecret } from "../utils/generateAppleClientSecret.js"

class AppleAuthService extends BaseApiClient {
    constructor() {
        super({
            baseURL: `https://appleid.apple.com`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            rateLimit: {
                keyPrefix: "limit:appleAuth",
                points: 100,
                duration: 1
            }
        })
    }

    getApplePublicKey() {
        return this.request({
            method: "GET",
            url: "/auth/keys"
        })
    }

    exchangeAppleCode(code, platform) {
        const { clientSecret, clientId } = generateAppleClientSecret(platform)

        return this.request({
            method: "POST",
            url: "/auth/token",
            data: {
                client_id: clientId,         
                client_secret: clientSecret,
                code: code,
                grant_type: "authorization_code",
                ...(platform === "web" && { redirect_uri: process.env.APPLE_REDIRECT_URI })
            }
        })
    }
}

export default AppleAuthService