import { banSchema } from "../joiSchemas/banSchema.js";
import User from "../models/User.js";
import validate from "../utils/validate.js";

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
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.role == "moderator") {
            return res.status(404).json({ error: "You cannot ban a moderator" });
        }
        user.isBanned = true;
        user.banReason = reason.trim();
        await user.save()
        res.json({ message: "User banned successfully" });
    } catch (err) {
        console.error("Ban error:", err);
        res.status(500).json({ error: "Failed to ban user" });
    }
};

export const unbanUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.isBanned == false) {
            return res.status(400).json({ error: "User is not banned" });
        }
        user.isBanned = false;
        user.banReason = "";
        await user.save()
        res.json({ message: "User unbanned successfully" });
    } catch (err) {
        console.error("Unban error:", err);
        res.status(500).json({ error: "Failed to unban user" });
    }
};

export const getUsersForModeration = async (req, res) => {
    const { banned, search, page = 1 } = req.query;
    const limit = 10;


    const query = {};

    if (banned === "true") {
        query.isBanned = true;
    }

    if (search) {
        query.email = { $regex: new RegExp(search, "i") };
    }

    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const users = await User.find(query)
            .sort({ email: 1 })
            .skip(skip)
            .limit(limit)
            .select("name email isBanned banReason");

        const total = await User.countDocuments(query);

        res.json({
            users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error("Fetch users error:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};
