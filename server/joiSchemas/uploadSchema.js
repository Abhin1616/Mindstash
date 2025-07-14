import Joi from "joi";

const uploadSchema = Joi.object({
    title: Joi.string().trim().max(100).required().messages({
        "string.empty": "Title is required",
        "string.max": "Title must be under 100 characters"
    }),
    description: Joi.string().trim().max(300).allow("").messages({
        "string.max": "Description must be under 300 characters"
    })
});

export default uploadSchema;
