import BaseApiClient from "./BaseApiClient.js"

class GoogleAuthService extends BaseApiClient {
    constructor() {
        super({
            baseURL: `https://oauth2.googleapis.com`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            rateLimit: {
                keyPrefix: "limit:googleAuth",
                points: 1000,
                duration: 1
            }
        })
    }

    async exchangeCodeForTokens(authCode) {
        return this.request({
            method: "POST",
            url: `/token`,
            data: {
                code: authCode,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: `${process.env.BACKEND_URL}/api/auth/google`,
                grant_type: "authorization_code"
            }
        })
    }
}

export default GoogleAuthService