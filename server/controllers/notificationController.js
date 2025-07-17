import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
    const notifications = await Notification.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json({ notifications });
};

export const markAllSeen = async (req, res) => {
    await Notification.updateMany(
        { user: req.user.id, seen: false },
        { seen: true }
    );

    res.status(200).json({ message: "All notifications marked as seen" });
};
