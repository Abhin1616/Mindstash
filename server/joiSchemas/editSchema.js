import Joi from "joi";
import cleanName from "../utils/cleanName.js";
import PROGRAMS from "../config/programs.js";

const editSchema = Joi.object({
    name: Joi.string()
        .trim()
        .custom((value, helpers) => {
            const cleaned = cleanName(value);
            if (cleaned.length < 2 || cleaned.length > 40) {
                return helpers.message("Name must be 2–40 characters after cleaning");
            }

            const namePattern = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
            if (!namePattern.test(cleaned)) {
                return helpers.message("Name must contain only alphabetic words");
            }

            return cleaned;
        })
        .required()
        .messages({
            "string.base": "Name must be a string",
            "string.empty": "Name cannot be empty",
            "any.required": "Name is required"
        }),


    program: Joi.string()
        .valid(...PROGRAMS.map(p => p.name))
        .messages({
            "any.only": "Invalid program selected"
        }),

    branch: Joi.string()
        .trim()
        .custom((value, helpers) => {
            const { program } = helpers.state.ancestors[0];
            const foundProgram = PROGRAMS.find(p => p.name === program);
            if (!foundProgram || !foundProgram.branches.some(b => b.name === value)) {
                return helpers.message("Invalid branch for selected program");
            }
            return value;
        })
        .messages({
            "string.base": "Branch must be a string"
        }),

    semester: Joi.number()
        .min(1)
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
        .messages({
            "number.base": "Semester must be a number"
        })
}).required();

export default editSchema;