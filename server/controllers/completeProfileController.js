import completeProfileSchema from "../joiSchemas/completeProfileSchema.js";
import User from "../models/User.js";
import validate from "../utils/validate.js";

export const completeProfile = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Request body cannot be empty" });
    }

    const { valid, error } = validate(completeProfileSchema, req.body);
    if (!valid) return res.status(400).json({ error });
    const { program, branch, semester } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (user.program || user.branch || user.semester) {
        return res.status(403).json({ error: "You cannot do this action" });
    }
    user.program = program;
    user.branch = branch;
    user.semester = semester;
    user.profileCompleted = true;

    await user.save();

    res.status(200).json({ message: "Profile completed successfully" });
};
