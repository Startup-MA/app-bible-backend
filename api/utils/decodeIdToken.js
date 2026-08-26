export function decodeIdToken(idToken) {
    // A JWT is split into three parts by dots (Header.Payload.Signature)
    const payloadBase64 = idToken.split(".")[1]

    // Decode the Base64 payload into a JSON string, then parse it
    const decodedJson = Buffer.from(payloadBase64, "base64").toString("utf-8")
    const profile = JSON.parse(decodedJson)

    return profile
}