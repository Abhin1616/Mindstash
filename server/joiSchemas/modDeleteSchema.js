// validations/modDeleteSchema.js
import Joi from "joi";
import RULES from "../config/rules.js";

const allowedRuleIds = RULES.map(rule => rule.id);

const modDeleteSchema = Joi.object({
    brokenRules: Joi.array()
        .items(Joi.string().valid(...allowedRuleIds))
        .min(1)
        .required()
        .messages({
            "array.base": "Broken rules must be an array",
            "array.includes": "Invalid rule selected",
            "array.min": "At least one broken rule must be selected",
            "any.required": "Broken rules are required"
        })
});

export default modDeleteSchema;
