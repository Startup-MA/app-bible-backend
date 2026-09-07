import jwkToPem from "jwk-to-pem"
import redisClient from "../connections/redis.js"
import { logger } from "../utils/logger.js"
import ApiGateway from "../outboundAPI/ApiGateway.js"
import AppError from "../errors/AppError.js"

const { Cache } = redisClient

export async function getApplePublicKey(kid) {
    const redisKey = `apple_jwk:${kid}`

    const cachedPem = await Cache.get(redisKey).catch((error) => {
        logger.error("", {stack: error.stack})
    })

    if (cachedPem) return cachedPem

    const data = await ApiGateway.appleAuth.getApplePublicKey()
    
    const matchingJwk = data.keys.find(key => key.kid === kid)

    if (!matchingJwk) {
        throw AppError.conflict("Matching key not found in Apple public keys")
    }

    const pemKey = jwkToPem(matchingJwk)

    await Cache.setEx(redisKey, 86400, pemKey).catch((error) => {
        logger.error("", {stack: error.stack})
    })

    return pemKey
}