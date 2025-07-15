import Joi from "joi";
import RULES from "../config/rules.js";

const allowedRuleIds = RULES.map(rule => rule.id);

const reportSchema = Joi.object({
    materialId: Joi.string()
        .length(24)
        .hex()
        .required()
        .messages({
            "string.base": "Material ID must be a string",
            "string.length": "Invalid Material ID format",
            "any.required": "Material ID is required"
        }),

    reason: Joi.string()
        .trim()
        .max(200)
        .required()
        .messages({
            "string.empty": "Reason is required",
            "string.max": "Reason must be under 200 characters"
        }),

    brokenRules: Joi.array()
        .items(Joi.string().valid(...allowedRuleIds))
        .default([])
});
export default reportSchema;
