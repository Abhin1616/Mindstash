import Joi from "joi";
import PROGRAMS from "../config/programs.js";

const completeProfileSchema = Joi.object({
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

export default completeProfileSchema;
