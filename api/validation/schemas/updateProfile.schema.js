import Joi from "joi"

const nameSchema = Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
        "string.base": "Name must be a string",
        "string.empty": "Name connot be empty",
        "string.max": "Name length must be less than 100",
        "any.required": "Name is required"
    })

const surnameSchema = Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
        "string.base": "Surname must be a string",
        "string.empty": "Surname connot be empty",
        "string.max": "Surname length must be less than 100",
        "any.required": "Surname is required"
    })

const sexSchema = Joi.string()
    .trim()
    .uppercase()
    .pattern(/^(M|F)$/)
    .required()
    .messages({
        "string.base": "Sex must be a string",
        "string.empty": "Sex connot be empty",
        "string.pattern.base": "Sex must be M or F",
        "any.required": "Sex is required"
    })

const ageSchema = Joi.number()
    .positive()
    .integer()
    .required()
    .min(1)
    .max(122)
    .messages({
        "number.base": "Age must be a number",
        "number.empty": "Age connot be empty",
        "number.min": "Age must be minimum 1",
        "number.max": "Age must be maximum 122",
        "any.required": "Age is required"
    })

const countrySchema = Joi.string()
    .trim()
    .required()
    .max(100)
    .messages({
        "string.base": "Country must be a string",
        "string.empty": "Country connot be empty",
        "string.max": "Country length must be equal to 1",
        "any.required": "Country is required"
    })

const occurredAtSchema = Joi.date()
    .iso()
    .required()
    .messages({
        "date.format": "occurredAt must be in a proper iso format",
        "any.required": "occurredAt is required"
    })

export const updateProfileSchema = Joi.object({
    name: nameSchema,
    surname: surnameSchema,
    sex: sexSchema,
    country: countrySchema,
    age: ageSchema,
    occurredAt: occurredAtSchema  
}).and("name", "surname", "sex", "country", "age", "occurredAt")


