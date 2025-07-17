import UserModel from "../models/User.js";

export default async function requireCompletedProfile(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Log in first" });
    }

    const user = await UserModel.findById(req.user.id).select("profileCompleted");
    if (!user?.profileCompleted) {
        return res.status(403).json({ error: "Complete academic profile first." });
    }

    next();
}
