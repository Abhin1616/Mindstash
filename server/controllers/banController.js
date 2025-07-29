import { banSchema } from "../joiSchemas/banSchema";
import User from "../models/User";
import validate from "../utils/validate";

export const banUser = async (req, res) => {
    const { userId } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Request body cannot be empty" });
    }

    const { error } = validate(banSchema, req.body);
    if (error) {
        return res.status(400).json({ error });
    }

    const { reason } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, {
            isBanned: true,
            banReason: reason.trim()
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User banned successfully" });
    } catch (err) {
        console.error("Ban error:", err);
        res.status(500).json({ error: "Failed to ban user" });
    }
};

export const unbanUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findByIdAndUpdate(userId, {
            isBanned: false,
            banReason: "",
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User unbanned successfully" });
    } catch (err) {
        console.error("Unban error:", err);
        res.status(500).json({ error: "Failed to unban user" });
    }
};
