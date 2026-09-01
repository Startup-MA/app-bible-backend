import Joi from "joi"
import { bible_id } from "./bookmark.schema.js"
import { bibleBooksNames } from "../assets/bibleBooksNames.js"

export const getHighlightsSchema = Joi.object({
    book: Joi.string().valid(...bibleBooksNames),
    bible_id: bible_id
})