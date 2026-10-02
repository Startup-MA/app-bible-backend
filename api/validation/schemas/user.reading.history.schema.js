import Joi from "joi"
import { 
    uuid,
} from "./bookmark.schema.js"

import { bibleBooksNames } from "../assets/bibleBooksNames.js"

const updated_at = Joi.date()
    .iso()
    .required()
    .messages({
        "date.format": "updated_at must be in a proper iso format",
        "any.required": "updated_at is required"
    })

const verse = Joi.number()
    .positive()
    .integer()
    .required()
    .min(1)
    .max(200)
    .messages({
        "number.base": "verse must be a number",
        "number.empty": "verse connot be empty",
        "number.min": "verse must be minimum 1",
        "number.max": "verse must be maximum 200",
        "any.required": "verse is required"
    })

const chapter = verse
    .messages({
        "number.base": "chapter must be a number",
        "number.empty": "chapter connot be empty",
        "number.min": "chapter must be minimum 1",
        "any.required": "chapter is required"
    })

const book = Joi.object()
    .pattern(
        Joi.string().valid(...bibleBooksNames),
        Joi.object().pattern(
            chapter,
            verse
        ).length(1)
    ).length(1)

const userReadingHistoryJson = Joi.object()
    .pattern(
        Joi.string(),
        book
    ).min(1).max(66)
    .messages({
        "object.min": "user reading history json must have at least 1 key",
        "object.max": "user reading history json could not have more than 66 keys",
        "object.pattern.match": "user reading history json doesn't match"
    })


const createUserReadingHistorySchema = Joi.object({
    user_reading_history_json: userReadingHistoryJson,
    uuid: uuid,
}).and(
        "user_reading_history_json",
        "uuid"
    )

const updateUserReadingHistorySchema = Joi.object({
    new_user_reading_history_json: userReadingHistoryJson,
    uuid: uuid,
    updated_at: updated_at,
}).and(
        "new_user_reading_history_json",
        "uuid",
        "updated_at"
    )

export const syncUserReadingHistorySchema = Joi.object({
    created: createUserReadingHistorySchema,
    updated: updateUserReadingHistorySchema
}).or("created", "updated")
.length(1)
.messages({
    "object.length": "sync user reading history object must contain only 1 key"
})
