import runInTransaction from "./runInTransaction.js"
import pool from "../connections/pg.js"
import { logger } from "../utils/logger.js"

const queryWithRetry = async (text, params, maxRetries = 3) => {
	let attempts = 0

	while (attempts < maxRetries) {
		try {
			const res = await pool.query(text, params)

			return res

		} catch (err) {
			attempts++
			
			// 3. Check if the error is "Retryable"
			// We only retry on network/connection errors, NOT SQL syntax errors.
			const isConnectionError = isRetryableError(err)

			if (isConnectionError && attempts < maxRetries) {
				// Calculate wait time (Exponential Backoff): 100ms, 200ms, 400ms...
				const waitTime = Math.pow(2, attempts) * 50
				
				logger.warn(`Database error (Attempt ${attempts}/${maxRetries}). Retrying in ${waitTime}ms... Error: ${err.message}`)
				
				// Wait before retrying
				await new Promise(res => setTimeout(res, waitTime))
			} else {
				// If it's a syntax error or we ran out of retries, throw the error to the app
				logger.error("Database query failed permanently.")
				throw err
			}
		}
	}
}

const queryTransactionWithRetry = async (callback, maxRetries = 3) => {
	let attempts = 0

	while (attempts < maxRetries) {
		try {
			const res = await runInTransaction(callback, pool)

			return res

		} catch (err) {
			attempts++
			
			// 3. Check if the error is "Retryable"
			// We only retry on network/connection errors, NOT SQL syntax errors.
			const isConnectionError = isRetryableError(err)

			if (isConnectionError && attempts < maxRetries) {
				const waitTime = Math.pow(2, attempts) * 50
				
				logger.warn(`Database error (Attempt ${attempts}/${maxRetries}). Retrying Transaction in ${waitTime}ms... Error: ${err.message}`)
				
				await new Promise(res => setTimeout(res, waitTime))
			} else {
				// If it's a syntax error or we ran out of retries, throw the error to the app
				logger.error("Database Transaction Query failed permanently.")
				throw err
			}
		}
	}
}


function isRetryableError(err) {
  // --- 1. NETWORK / OS ERRORS ---
    // These happen when the TCP link is severed or silent.
    const networkErrors = [
        "ECONNRESET", // Peer (Pod) reset connection
        "ETIMEDOUT",  // Network packet lost (silent drop)
        "EPIPE",      // Writing to a closed socket
        "EHOSTUNREACH" // Minikube/K8s networking issue
    ]
    if (networkErrors.includes(err.code)) return true

    // --- 2. PGBOUNCER / POSTGRES ERRORS (SQLSTATE) ---
    // Postgres uses 5-char codes. We check the prefix or specific codes.
    if (err.code) {
        // 57Pxx = Admin Shutdown / Crash (e.g., Pod restart)
        if (err.code.startsWith("57P")) return true
        
        // 08xxx = Connection Exceptions
        // 08000, 08003, 08006 = Connection failures
        // 08P01 = Protocol violation (Often sent by PgBouncer on limits)
        if (err.code.startsWith("08")) return true
        
        // 53300 = Too many connections (PgBouncer max_client_conn reached)
        // We RETRY this because maybe a slot will free up in 100ms.
        if (err.code === "53300") return true
    }

    // --- 3. GENERIC TEXT MATCHING ---
    // Sometimes (like with timeouts), the library doesn't set 'err.code'.
    const message = err.message || ""
    
    // Catch pool.query() timeout (client-side limit)
    if (message.includes("timeout exceeded when trying to connect")) return true
    
    // Catch PgBouncer "query_wait_timeout" (server-side queue limit)
    if (message.includes("query_wait_timeout")) return true
    
    // Catch "Connection terminated" (The Zombie Connection)
    if (message.includes("Connection terminated")) return true

    // --- 4. DO NOT RETRY ---
    // Syntax errors, Missing columns, Auth failures (password wrong), etc.
    return false
}

export default {
	query: queryWithRetry,
	queryTransaction: queryTransactionWithRetry
}