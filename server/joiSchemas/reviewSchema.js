import Joi from "joi";

const reviewSchema = Joi.object({
    status: Joi.string().valid("accepted", "rejected").required()
        .messages({
            "any.only": "Status must be either accepted or rejected",
            "any.required": "Status is required"
        }),
    moderatorComment: Joi.string().trim().max(300).allow("")
});

export default reviewSchema;
