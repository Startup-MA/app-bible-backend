import dotenv from "dotenv"
import bcrypt from "bcrypt"
import { logger } from "../utils/logger.js"

dotenv.config()

const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10

async function encrypt(plainPassword) {
    return await bcrypt.hash(plainPassword, saltRounds)
}

async function verifyPassword(plainPassword, storedHash) {
    return await bcrypt.compare(plainPassword, storedHash)
}

export default { encrypt: encrypt, verify: verifyPassword }