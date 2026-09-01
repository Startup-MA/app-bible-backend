import Joi from "joi"
import { bibleBooksNames } from "../assets/bibleBooksNames.js"

export const id = Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
        "number.base": "start_id must be a number",
        "number.empty": "start_id connot be empty",
        "any.required": "start_id is required"
    })

export const number = Joi
    .number()
    .integer()
    .positive()
    .required()
    .max(100)
    .messages({
        "number.base": "number must be a number",
        "number.empty": "number connot be empty",
        "any.required": "number is required"
    })

export const chapter = Joi.number()
        .positive()
        .integer()
        .required()
        .min(1)
        .max(200)
        .messages({
            "number.base": "chapter must be a number",
            "number.empty": "chapter connot be empty",
            "number.min": "chapter must be minimum 1",
            "number.max": "chapter must be maximum 200",
            "any.required": "chapter is required"
        })
    

export const verse = Joi.string()
    .custom((value, helper) => {
        const pattern = new RegExp("^([1-9][0-9]?|1[0-9]{2}|200)(?:-([1-9][0-9]?|1[0-9]{2}|200))?$")
        const match = value.match(pattern)
        
        if (!match) return helper.message("Verse must match the correct pattern (X or X-Y)")
        
        if (match[2]) return +match[1] < +match[2] ? value : helper.message("First number in combination cannot be bigger or equal to second one")
        
        return value	 
    })
    .required()
    .messages({
            "string.base": "verse must be a string",
            "string.empty": "verse connot be empty",
            "any.required": "verse is required"
    })

export const verses_combination = Joi.array().items(verse).min(1).required()

export const date = Joi.date()
    .iso()
    .required()
    .messages({
        "date.format": "date must be in a proper iso format",
        "any.required": "date is required"
    })

export const uuid = Joi.string()
    .guid()
    .required()
    .messages({
        "string.base": "uuid must be a string",
        "string.empty": "uuid connot be empty",
        "string.guid": "Please provide a valid uuid",
        "any.required": "uuid is required"
   })

export const bible_id = Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
        "number.base": "bible_id must be a number",
        "number.empty": "bible_id connot be empty",
        "any.required": "bible_id is required"
    })


const createBookmarkSchema = Joi.object({
    book: Joi.string().valid(...bibleBooksNames),
    chapter: chapter,
    verses_combination: verses_combination,
    date: date,
    uuid: uuid,
    bible_id: bible_id
})

export const syncBookmarksSchema = Joi.object({
    created: Joi.array().items(createBookmarkSchema).min(1),
    deleted: Joi.array().items(uuid).min(1)
}).or("created", "deleted")

export const getUserBookmarksSchema= Joi.object({
    start_id: id,
    number: number
})

