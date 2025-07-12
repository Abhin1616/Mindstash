import Joi from "joi";

const uploadSchema = Joi.object({
    title: Joi.string().trim().max(100).required().messages({
        "string.empty": "Title is required",
        "string.max": "Title must be under 100 characters"
    }),
    description: Joi.string().trim().max(300).allow("").messages({
        "string.max": "Description must be under 300 characters"
    }),
    fileUrl: Joi.string().uri().required().messages({
        "string.uri": "Invalid file URL",
        "any.required": "File URL is required"
    }),
    fileType: Joi.string().valid("pdf", "image").required().messages({
        "any.only": "Only PDF or image files are allowed",
        "any.required": "File type is required"
    })
});

export default uploadSchema;
