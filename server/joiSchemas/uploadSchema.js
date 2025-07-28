import Joi from "joi";
import PROGRAMS from "../config/programs.js";

const uploadSchema = Joi.object({
    title: Joi.string().trim().max(100).required().messages({
        "string.empty": "Title is required",
        "string.max": "Title must be under 100 characters"
    }),

    description: Joi.string().trim().max(500).required().messages({
        "string.empty": "Description is required",
        "string.max": "Description must be under 500 characters"
    }),

    program: Joi.string().trim().required().messages({
        "any.required": "Program is required",
        "string.empty": "Program is required"
    }),

    branch: Joi.string().trim().required().messages({
        "any.required": "Branch is required",
        "string.empty": "Branch is required"
    }),

    semester: Joi.number().min(1).required().custom((value, helpers) => {
        const { program, branch } = helpers?.state?.ancestors?.[0];

        if (!program || !branch) {
            return helpers.message("Program and branch are required to validate semester");
        }

        const foundProgram = PROGRAMS.find(p => p.name.trim().toLowerCase() === program.trim().toLowerCase());
        const foundBranch = foundProgram?.branches.find(b => b.name.trim().toLowerCase() === branch.trim().toLowerCase());

        if (!foundBranch) {
            return helpers.message("Invalid branch for selected program");
        }

        if (value < 1 || value > foundBranch.semesters) {
            return helpers.message(`Semester must be between 1 and ${foundBranch.semesters}`);
        }

        return value;
    }).messages({
        "number.base": "Semester must be a valid number",
        "number.min": "Semester must be at least 1",
        "any.required": "Semester is required"
    })
}).required();

export default uploadSchema;