import Joi from "joi"

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

export const passwordSchema = Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_+])[A-Za-z\d@$!%*?&_+]{8,}$/)
    .required()
    .messages({
        "string.base": "Password must be a string",
        "string.empty": "Password cannot be empty",
        "string.pattern.base": "Password must be 8+ characters, including an uppercase, lowercase, number, and symbol.",
        "any.required": "Password is required"
    })

export const uuidSchema = Joi.string()
    .guid()
    .required()
    .messages({
        "string.base": "UUID must be a string",
        "string.empty": "UUID connot be empty",
        "string.guid": "Please provide a valid UUID",
        "any.required": "UUID is required"
    })

export const code = Joi.number()
    .positive()
    .integer()
    .required()
    .min(100000)
    .max(999999)
    .messages({
        "number.base": "code must be a number",
        "number.empty": "code connot be empty",
        "number.min": "code must be minimum 100000",
        "number.max": "code must be maximum 999999",
        "any.required": "code is required"
    })

export const device = Joi.string()
    .trim()
    .pattern(/^(mobile|browser)$/)
    .lowercase()
    .required()
    .messages({
        "string.base": "device must be a string",
        "string.empty": "device cannot be empty",
        "string.pattern.base": "device must contain mobile or browser",
        "any.required": "device is required"
    })

export const registerSchema = Joi.object({
    email: emailSchema,
    password: passwordSchema 
})

export const loginSchema = Joi.object({
    email: emailSchema,
    password: passwordSchema 
})

export const resetCodeSchema = Joi.object({
    email: emailSchema,
    password: passwordSchema
})

export const forgotSchema = Joi.object({
    email: emailSchema
})

export const setNewPassSchema = Joi.object({
    new_password: passwordSchema
})

export const verifyUserUUIDSchema = Joi.object({
    uuid: uuidSchema
})

export const verifyUserCodeSchema = Joi.object({
    code: code,
    device: device
}).and("code", "device")
