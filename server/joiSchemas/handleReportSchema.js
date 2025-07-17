import Joi from "joi";

const handleReportSchema = Joi.object({
    action: Joi.string().valid("accept", "reject").required(),
    comment: Joi.string().max(500).allow("").optional()
});

export default handleReportSchema;
