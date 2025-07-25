import completeProfileSchema from "../joiSchemas/completeProfileSchema.js";
import User from "../models/User.js";
import validate from "../utils/validate.js";
import jwt from "jsonwebtoken";

export const completeProfile = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Request body cannot be empty" });
    }
    const { program, branch, semester } = req.body;
    const { userId } = req.query;
    const { valid, error } = validate(completeProfileSchema, { program, branch, semester });
    if (!valid) return res.status(400).json({ error });

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (user.profileCompleted) {
        return res.status(403).json({ error: "You cannot do this action" });
    }

    user.program = program;
    user.branch = branch;
    user.semester = semester;
    user.profileCompleted = true;

    await user.save();
    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.cookie("acc_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Profile completed successfully" });
};
