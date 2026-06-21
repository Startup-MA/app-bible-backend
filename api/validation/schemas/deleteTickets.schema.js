import Joi from "joi"

const fromSchema = Joi.number()
    .positive()
    .integer()
    .required()
    .messages({
        "number.base": "from must be a number",
        "number.empty": "from connot be empty",
        "any.required": "from is required"
    })

const toSchema = Joi.number()
    .positive()
    .integer()
    .required()
    .messages({
        "number.base": "to must be a number",
        "number.empty": "to connot be empty",
        "any.required": "to is required"
    })

export const deleteTicketsSchema = Joi.object({
    from: fromSchema,
    to: toSchema
}).and("from", "to")


