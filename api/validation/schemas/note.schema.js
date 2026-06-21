import Joi from "joi"
import { 
    verses_combination,
    date,
    uuid,
    bible_id,
    getUserBookmarksSchema,
    chapter
} from "./bookmark.schema.js"

import { bibleBooksNames } from "../assets/bibleBooksNames.js"


const content = Joi.string()
    .trim()
    .required()
    .max(250, "utf8")
    .messages({
        "string.base": "content must be a string",
        "string.empty": "content connot be empty",
        "string.max": "content could not exceed 250 charcters",
        "any.required": "content is required"
    })

const updated_at = Joi.date()
    .iso()
    .required()
    .messages({
        "date.format": "updated_at must be in a proper iso format",
        "any.required": "updated_at is required"
    })

const createNoteSchema = Joi.object({
    book: Joi.string().valid(...bibleBooksNames),
    chapter: chapter,
    verses_combination: verses_combination,
    content: content,
    date: date,
    uuid: uuid,
    bible_id: bible_id
})

const updateNoteSchema = Joi.object({
    new_content: content,
    uuid: uuid,
    updated_at: updated_at,
})

export const syncNotesSchema = Joi.object({
    created: Joi.array().items(createNoteSchema).min(1),
    updated: Joi.array().items(updateNoteSchema).min(1),
    deleted: Joi.array().items(uuid).min(1)
}).or("created", "updated", "deleted")

export const getUserNotesSchema = getUserBookmarksSchema