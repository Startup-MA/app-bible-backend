import Joi from "joi"

const subjectSchema = Joi.string()
    .trim()
    .pattern(/^(Subscription|How to|System bug|Partnership|Other)$/)
    .required()
    .messages({
        "string.base": "Subject must be a string",
        "string.empty": "Subject connot be empty",
        "string.pattern.base": "Subject must be one of (Subscription, How to, System bug, Partnership or Other)",
        "any.required": "Subject is required"
    })

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

export const emailSchema = Joi.string()
    .trim()
    .email()
    .lowercase()
    .required()
    .messages({
        "string.base": "Email must be a string",
        "string.empty": "Email connot be empty",
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required"
    })

const timestampSchema = Joi.date()
    .iso()
    .required()
    .messages({
        "date.format": "timestamp must be in a proper iso format",
        "any.required": "timestamp is required"
    })

const messageSchema = Joi.string()
    .trim()
    .required()
    .max(1000, "utf8")
    .messages({
        "string.base": "Message must be a string",
        "string.empty": "Message connot be empty",
        "string.max": "Message could not exceed 1000 charcters",
        "any.required": "Message is required"
    })

export const createTicketSchema = Joi.object({
    subject: subjectSchema,
    name: nameSchema,
    email: emailSchema,
    timestamp: timestampSchema,
    message: messageSchema,
}).and("subject", "name", "email", "timestamp", "message",)


