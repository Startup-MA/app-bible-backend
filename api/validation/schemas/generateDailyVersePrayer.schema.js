import Joi from "joi"
import { languages } from "../assets/languages.js"

const updated_at = Joi.string()
    .isoDate()
    .required()
    .prefs({ convert: false })
    .messages({
        "date.format": "updated_at must be in a proper iso format",
        "any.required": "updated_at is required"
    })

export const generateDailyVersePrayerSchema = Joi.object({
    language: Joi.string().valid(...languages),
    updated_at: updated_at
}).and("language", "updated_at")