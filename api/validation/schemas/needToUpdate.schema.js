import Joi from "joi"
import { appVersionSchema } from "./updateAppVersion.schema.js"

export const needToUpdateSchema = Joi.object({
    os: Joi.string().valid("android", "ios"),
    version: appVersionSchema
}).and("os", "version")