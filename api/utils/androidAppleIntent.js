import { logger } from "./logger.js"

export function androidAppleIntent(query) {
    const packageName = process.env.ANDROID_PACKAGE_NAME

    if (!packageName || !/^[a-zA-Z0-9._]+$/.test(packageName)) {
        logger.error("ANDROID_PACKAGE_NAME is missing or invalid")
        return null
    }

    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(query)) {
        if (value) params.set(key, value)
    }

    return `intent://callback?${params.toString()}#Intent;package=${packageName};scheme=signinwithapple;end`
}
