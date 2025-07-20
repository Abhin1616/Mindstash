import Joi from "joi";

const uploadSchema = Joi.object({
    title: Joi.string().trim().max(100).required().messages({
        "string.empty": "Title is required",
        "string.max": "Title must be under 100 characters"
    }),
    description: Joi.string().trim().max(500).required().messages({
        "string.empty": "Description is required",
        "string.max": "Description must be under 500 characters"
    })
}).required();

export default uploadSchema;
