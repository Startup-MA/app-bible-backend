import jwt from "jsonwebtoken"
import { getApplePublicKey } from "./getApplePublicKey.js"
import AppError from "../errors/AppError.js"

export async function verifyAppleIdToken(id_token, client_id) {

	const decodedComplete = jwt.decode(id_token, { complete: true })

	if (!decodedComplete || !decodedComplete.header?.kid) {
		throw AppError.conflict("Invalid Apple id_token header")
  	}

	const pemKey = await getApplePublicKey(decodedComplete.header.kid)

	return jwt.verify(id_token, pemKey, {
		algorithms: ["RS256"],
		issuer: "https://appleid.apple.com",
		audience: client_id,
	})
}