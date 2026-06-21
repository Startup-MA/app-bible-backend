import Joi from "joi"
import {
    bible_id,
    uuid,
    chapter
} from "./bookmark.schema.js"

import { bibleBooksNames } from "../assets/bibleBooksNames.js"
import { highlightColors } from "../assets/highlightColors.js"

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
    .min(1)
    .max(200)
    .required()

const colors = Joi.object()
    .pattern(
        Joi.string().valid(...highlightColors),
        Joi.array().items(verse).min(1).max(200).required()
    ).min(1)

const createHighlightSchema = Joi.object({
    book: Joi.string().valid(...bibleBooksNames),
    chapter: chapter,
    highlights: colors,
    uuid: uuid,
    bible_id: bible_id
}).and(
        "book",
        "chapter",
        "highlights",
        "uuid",
        "bible_id"
    )

const updateHighlightSchema = Joi.object({
    new_highlights: colors,
    uuid: uuid,
    updated_at: updated_at
}).and(
        "new_highlights",
        "uuid",
        "updated_at"
    )

export const syncHighlightsSchema = Joi.object({
    created: Joi.array().items(createHighlightSchema),
    updated: Joi.array().items(updateHighlightSchema),
    deleted: Joi.array().items(uuid)
}).or("created", "updated", "deleted")
