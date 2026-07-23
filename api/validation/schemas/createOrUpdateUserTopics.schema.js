import Joi from "joi"
import { topics } from "../assets/topics.js"

export const createOrUpdateUserTopicsSchema = Joi.object({
    topics: Joi.array().items(Joi.string().valid(...topics)).min(1),
}).length(1)