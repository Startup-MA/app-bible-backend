import jwt from "jsonwebtoken"

export function generateAppleClientSecret(platform) {
    const teamId = process.env.APPLE_TEAM_ID
    const keyId = process.env.APPLE_KEY_ID
    
    const privateKey = process.env.APPLE_PRIVATE_KEY
    
    const clientId = platform === "ios"
        ? process.env.APPLE_APP_ID
        : process.env.APPLE_SERVICE_ID

    const timeNow = Math.floor(Date.now() / 1000)
    
    const claims = {
        iss: teamId,
        iat: timeNow,
        exp: timeNow + (86400 * 30), // Valid for 30 days
        aud: "https://appleid.apple.com",
        sub: clientId,
    };

    const headers = {
        alg: "ES256",
        kid: keyId,
    }

    const clientSecret = jwt.sign(claims, privateKey, {
        algorithm: "ES256",
        header: headers,
    })

    return { clientSecret, clientId }
}