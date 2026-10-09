export function browserAppleReturnPath(returnTo, fallback) {
    if (typeof returnTo !== "string" || returnTo.length > 512) return fallback
    if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return fallback
    if (returnTo.includes("\\") || returnTo.includes("://")) return fallback
    if (/[\u0000-\u001F\u007F]/.test(returnTo)) return fallback

    return returnTo
}
