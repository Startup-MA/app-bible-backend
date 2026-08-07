import Joi from "joi"
import { 
    uuid,
    getUserBookmarksSchema
} from "./bookmark.schema.js"

const title = Joi.string()
    .trim()
    .required()
    .max(100, "utf8")
    .messages({
        "string.base": "title must be a string",
        "string.empty": "title connot be empty",
        "string.max": "title could not exceed 100 charcters",
        "any.required": "title is required"
    })

const content = Joi.string()
    .trim()
    .required()
    .max(1000, "utf8")
    .messages({
        "string.base": "content must be a string",
        "string.empty": "content connot be empty",
        "string.max": "content could not exceed 1000 charcters",
        "any.required": "content is required"
    })

const new_title = title.messages({
    "string.base": "new_title must be a string",
    "string.empty": "new_title connot be empty",
    "string.max": "new_title could not exceed 100 charcters",
    "any.required": "new_title is required"
})

const new_content = content.messages({
    "string.base": "new_content must be a string",
    "string.empty": "new_content connot be empty",
    "string.max": "new_content could not exceed 1000 charcters",
    "any.required": "new_content is required"
}) 

const updated_at = Joi.date()
    .iso()
    .required()
    .messages({
        "date.format": "updated_at must be in a proper iso format",
        "any.required": "updated_at is required"
    })

const createPrayersSchema = Joi.object({
    title: title,
    content: content,
    uuid: uuid,
})

const updatePrayerSchema = Joi.object({
    new_title: new_title,
    new_content: new_content,
    uuid: uuid,
    updated_at: updated_at,
})

export const syncPrayersSchema = Joi.object({
    created: Joi.array().items(createPrayersSchema).min(1),
    updated: Joi.array().items(updatePrayerSchema).min(1),
    deleted: Joi.array().items(uuid).min(1)
}).or("created", "updated", "deleted")

export const getUserPrayersSchema = getUserBookmarksSchema