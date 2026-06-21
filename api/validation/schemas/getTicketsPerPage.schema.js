import Joi from "joi"

const pageSchema = Joi.number()
    .positive()
    .integer()
    .required()
    .messages({
        "number.base": "page must be a number",
        "number.empty": "page connot be empty",
        "any.required": "page is required"
    })

export const getTicketsPerPageSchema = Joi.object({
    page: pageSchema
})