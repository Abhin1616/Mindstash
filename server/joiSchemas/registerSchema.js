import Joi from "joi";
import PROGRAMS from "../config/programs.js";
import cleanName from "../utils/cleanName.js";


const registerSchema = Joi.object({
    name: Joi.string()
        .custom((value, helpers) => {
            const cleaned = cleanName(value);
            if (cleaned.length < 2 || cleaned.length > 40) {
                return helpers.message("Name must be 2–40 characters after cleaning");
            }
            const namePattern = /^[A-Za-z]+(?: [A-Za-z]+){0,3}$/;
            if (!namePattern.test(cleaned)) {
                return helpers.message("Name must contain only alphabetic words (1–4 words)");
            }
            return cleaned;
        })
        .required()
        .messages({
            "any.required": "Name is required"
        }),

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
        .pattern(
            new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$')
        )
        .required()
        .messages({
            "string.pattern.base": "Password must be 8–30 characters, include uppercase, lowercase, number, and special character",
            "string.empty": "Password is required",
            "any.required": "Password is required"
        }),

    program: Joi.string()
        .valid(...PROGRAMS.map(p => p.name))
        .required()
        .messages({
            "any.only": "Invalid program selected",
            "any.required": "Program is required"
        }),

    branch: Joi.string()
        .required()
        .custom((value, helpers) => {
            const { program } = helpers.state.ancestors[0];
            const foundProgram = PROGRAMS.find(p => p.name === program);
            if (!foundProgram || !foundProgram.branches.some(b => b.name === value)) {
                return helpers.message("Invalid branch for selected program");
            }
            return value;
        }),

    semester: Joi.number()
        .min(1)
        .required()
        .custom((value, helpers) => {
            const { program, branch } = helpers.state.ancestors[0];
            const foundProgram = PROGRAMS.find(p => p.name === program);
            const foundBranch = foundProgram?.branches.find(b => b.name === branch);
            if (!foundBranch) return helpers.message("Invalid branch");
            if (value < 1 || value > foundBranch.semesters) {
                return helpers.message(`Semester must be between 1 and ${foundBranch.semesters}`);
            }
            return value;
        })
}).required();

export default registerSchema;