import Joi from "joi"
import { topics } from "../assets/topics.js"

const updated_at = Joi.date()
    .iso()
    .required()
    .messages({
        "date.format": "updated_at must be in a proper iso format",
        "any.required": "updated_at is required"
    })

export const createOrUpdateUserTopicsSchema = Joi.object({
    topics: Joi.array().items(Joi.string().valid(...topics)).min(1),
    updated_at: updated_at
}).and("topics", "updated_at")