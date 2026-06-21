async function publish(redisClient, streamName, data) {
    const messId = await redisClient.xAdd(
        streamName, "*", data
    )

    return messId
}

export default {
    publish: publish
}