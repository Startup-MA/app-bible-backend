async function runInTransaction (callback, pool) {
	const client = await pool.connect()

	try {
		await client.query("BEGIN")

		const result = await callback(client)

		await client.query("COMMIT")

		return result
	} catch (e) {
		await client.query("ROLLBACK")
		
		throw e
	} finally {
		client.release()
	}
}

export default runInTransaction