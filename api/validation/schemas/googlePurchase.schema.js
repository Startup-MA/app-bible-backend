import Joi from "joi"

export const googlePurchaseSchema = Joi.object({
    purchaseToken: Joi.string().trim().min(1).max(4096).required().messages({
        "string.base": "purchaseToken must be a string",
        "string.empty": "purchaseToken cannot be empty",
        "any.required": "purchaseToken is required"
    })
})
