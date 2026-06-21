import Joi from "joi"

const itemSchema = Joi.object({
    quantity: 1,
    price_id: Joi.string().trim().required().messages({
        "string.base": "price_id must be a string",
        "string.empty": "price_id connot be empty",
        "any.required": "price_id is required"
   })
})

export const upgradePlanSchema = Joi.object({
    proration_billing_mode: Joi.string().required().pattern(new RegExp("prorated_immediately")),
    items: Joi.array().items(itemSchema).min(1).max(1), 
    on_payment_failure: Joi.string().required().regex(new RegExp("prevent_change"))
}).and(
    "proration_billing_mode",
    "items",
    "on_payment_failure"
)
