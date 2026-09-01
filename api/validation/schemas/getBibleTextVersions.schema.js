import Joi from "joi"
import { languages } from "../assets/languages.js"

export const getBibleTextVersionsSchema = Joi.object({
    language: Joi.string().valid(...languages),
}).length(1)