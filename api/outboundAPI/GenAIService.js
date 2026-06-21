import BaseApiClient from "./BaseApiClient.js"

class GenAIService extends BaseApiClient {
    constructor() {
        super({
            baseURL: 'https://api.openai.com/v1',
            timeout: 30000, // AI requests take longer, increase timeout to 30s
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            // Example: Limit to 50 requests per minute (60 seconds)
            rateLimit: {
                keyPrefix: 'limit:openai',
                points: 50,
                duration: 60 
            }
        })
    }

    async generateText(prompt, userId) {
        // Example: You might cache AI responses based on the exact prompt
        // to save money if users ask the exact same question frequently.
        const cacheKey = `ai:response:${Buffer.from(prompt).toString('base64')}`

        return this.request(
            {
                method: 'POST', // Note: Even though it's a POST, some APIs allow caching identical requests. You can adjust the BaseClass if you want to allow POST caching.
                url: '/chat/completions',
                data: {
                    model: 'gpt-4o',
                    messages: [{ role: 'user', content: prompt }]
                }
            },
            // Optional: Cache identical AI responses for 24 hours to save API credits
            // { key: cacheKey, ttl: 86400 } 
        )
    }
}

export default GenAIService