import BaseApiClient from "./BaseApiClient.js"
import { bibleBooksNames } from "../validation/assets/bibleBooksNames.js"
import { logger } from "../utils/logger.js"

class GenAIService extends BaseApiClient {
    constructor() {
        super({
            baseURL: "https://api.openai.com/v1",
            timeout: 30000, // AI requests take longer, increase timeout to 30s
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            // Example: Limit to 50 requests per minute (60 seconds)
            rateLimit: {
                keyPrefix: "limit:openai",
                points: 500,
                duration: 60 
            }
        })
    }

    async generateVerseAndPrayer(userTopics, userLanguage) {
        // const cacheKey = `ai:response:${Buffer.from(prompt).toString('base64')}`
        const randomBook = bibleBooksNames[Math.floor(Math.random() * bibleBooksNames.length)]
        const randomSetOfTopics = [...new Set(Array.from({ length: 3 }, () => Math.floor(Math.random() * userTopics.split(", ").length)))].map(element => userTopics.split(", ")[element]).join(", ")

        const result = await this.request(
            {
                method: "POST",
                url: "/chat/completions",
                data: {
                    model: "gpt-4.1-nano",
                    messages: [
                        {
                            role: "system",
                            content: `You are a spiritual assistant. When given a set of topics, return a relevant Bible verse, and a heartfelt prayer connecting the verse to the topics. Do not use famous, frequently quoted, or commonly memorized verses. Dig deep into the scriptures to find lesser-known, unique verses (hidden gems) that perfectly match the topic. Output your response strictly as JSON with the keys: 'verse', and 'prayer'. Schema: "verse": {"book":"Isaiah","chapter":"41","verse":"10"}, "prayer": {"title":"Some title","prayer":"Content"}`
                        },
                        {
                            role: "user",
                            content: `Topics: ${randomSetOfTopics}. IMPORTANT CONSTRAINT: You MUST select a verse from the book of ${randomBook}. Do not use any other book. Write the prayer using this language ${userLanguage}. JSON schema in english.`
                        }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" },
                }
            }
        )

        try {

            const json = JSON.parse(result.choices[0].message.content)
            const choice = result.choices[0]
        
            if (choice.finish_reason === "content_filter") {
                logger.error("OpenAI's content filter stopped the generation.")
                return {noSuccess: true}
            } else if (choice.finish_reason !== "stop") {
                logger.error(`Generation stopped unexpectedly. Reason: ${choice.finish_reason}`)
                return {noSuccess: true}
            }

            if (!bibleBooksNames.filter((book) => book === json.verse.book).length) {
                logger.error(`Unexpected book name: ${json.verse.book}`)
                return {noSuccess: true}
            } else if (!+json.verse.chapter) {
                logger.error(`Chapter is not a number: ${json.verse.chapter}`)
                return {noSuccess: true}
            } else if (json.verse.verse.length > 7) {
                logger.error(`Verse is not a number: ${json.verse.verse}`)
                return {noSuccess: true}
            }

            if (!json.prayer.title || json.prayer.title.length > 100) {
                logger.error(`Prayer title is empty. Reason: ${json.prayer.title}`)
                return {noSuccess: true}
            }

            if (!json.prayer.prayer || json.prayer.prayer.length > 1000) {
                logger.error(`Prayer content is empty. Reason: ${json.prayer.prayer}`)
                return {noSuccess: true}
            }

            return {
                noSuccess: false,
                result: json
            }
        } catch(error) {
            logger.error("Error occured during verification of the generated content")
            logger.error("", {stack: error.stack})

            return {noSuccess: true}
        }
    }

    async translateUserPrayer(userPrayer, language) {
        const result = await this.request(
            {
                method: "POST",
                url: "/chat/completions",
                data: {
                    model: "gpt-4.1-nano",
                    messages: [
                        {
                        	role: "system",
                        	content: `When given a JSON return a translation into provided language of the prayer title and prayer content of this JSON. Make this translation native and natural. Don't touch keys of the JSON structure, translate only field values. Return back entire JSON with translated specific parts. Use this schema: "prayer": { "title": "Some title", "prayer": "Content" }`
                        },
                        {
                        	role: "user",
                        	content: `JSON: ${JSON.stringify(userPrayer)}. Translate into this language ${language}. JSON schema in english.`
                        }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                }
            }
        )
        
        try {

            const json = JSON.parse(result.choices[0].message.content)
            const choice = result.choices[0]
        
            if (choice.finish_reason === "content_filter") {
                logger.error("OpenAI's content filter stopped the generation.")
                return {noSuccess: true}
            } else if (choice.finish_reason !== "stop") {
                logger.error(`Generation stopped unexpectedly. Reason: ${choice.finish_reason}`)
                return {noSuccess: true}
            }

            if (!json.prayer.title || json.prayer.title.length > 100) {
                logger.error(`Prayer title is empty. Reason: ${json.prayer.title}`)
                return {noSuccess: true}
            }

            if (!json.prayer.prayer || json.prayer.prayer.length > 1000) {
                logger.error(`Prayer content is empty. Reason: ${json.prayer.prayer}`)
                return {noSuccess: true}
            }

            return {
                noSuccess: false,
                result: json
            }
        } catch(error) {
            logger.error("Error occured during verification of the translated content")
            logger.error("", {stack: error.stack})

            return {noSuccess: true}
        }
    }
}

export default GenAIService