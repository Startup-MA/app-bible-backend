import { logger } from "./logger.js"

export function readGoogleAuthState(state) {
    if (state === "mobile" || state === "browser") {
        return { device: state }
    }

    try {
        const parsed = JSON.parse(state)

        if (parsed && (parsed.device === "mobile" || parsed.device === "browser")) {
            return {
                device: parsed.device,
                returnTo: parsed.returnTo
            }
        }
    } catch (err) {
        logger.error("Google auth state is not a device value or JSON")
    }

    return { device: state }
}
