import UserModel from "../models/User.js";
import validate from "../utils/validate.js";
import editSchema from "../joiSchemas/editSchema.js";

export const getProfile = async (req, res) => {
    const user = await UserModel.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, email, program, branch, semester } = user;
    res.status(200).json({ name, email, program, branch, semester });
};

export const updateProfile = async (req, res) => {
    const { valid, error, value } = validate(editSchema, req.body);
    if (!valid) return res.status(400).json({ error });

    const updatedUser = await UserModel.findByIdAndUpdate(req.user.is, { $set: value }, { new: true, runValidators: true }).lean();
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    const { name, email, program, branch, semester } = updatedUser;
    res.status(200).json({ message: "Profile updated successfully", user: { name, email, program, branch, semester } });
};
