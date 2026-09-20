import Joi from "joi"

export const appVersionSchema = Joi.string()
    .trim()
    .pattern(/^(?!0\.0\.0$)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/)
    .required()
    .messages({
        "string.base": "App version must be a string",
        "string.empty": "App version connot be empty",
        "string.pattern.base": "App version must correspond to a proper format e.g. (1.0.0)",
        "any.required": "App version is required"
    })

const androidVersionSchema = Joi.object({
    mrv: appVersionSchema,
    mxav: appVersionSchema
})

const iosVersionSchema = Joi.object({
    mrv: appVersionSchema,
    mxav: appVersionSchema
})

export const updateAppVersionSchema = Joi.object({
    android: androidVersionSchema,
    ios: iosVersionSchema
}).and("android", "ios")