import Joi from "joi";

const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,8}$/)
        .required()
        .messages({
            "string.pattern.base": "Please enter a valid email address",
            "string.empty": "Email is required",
            "any.required": "Email is required"
        }),

    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Password is required",
            "any.required": "Password is required"
        })
});

export default loginSchema;