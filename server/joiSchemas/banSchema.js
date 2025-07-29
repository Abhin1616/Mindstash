import Joi from "joi";

export const banSchema = Joi.object({
    reason: Joi.string().trim().min(10).max(300).required().messages({
        "any.required": "Ban reason is required",
        "string.empty": "Ban reason cannot be empty",
        "string.min": "Ban reason must be at least 10 characters long",
        "string.max": "Ban reason must be under 300 characters"
    })
});
