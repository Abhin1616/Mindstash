import User from "../models/User.js";

export const checkBannedUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.isBanned) {
            return res.status(403).json({ error: "Access denied. Your account has been banned." });
        }

        next();
    } catch (err) {
        console.error("Banned user check error:", err);
        res.status(500).json({ error: "Failed to verify user ban status" });
    }
};
