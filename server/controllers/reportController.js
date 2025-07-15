import Report from "../models/Report.js";
import Material from "../models/Material.js";
import Notification from "../models/Notification.js";
import validate from "../utils/validate.js";
import reportSchema from "../joiSchemas/reportSchema.js";
import getPublicId from "../utils/getPublicId.js";

export const submitReport = async (req, res) => {
    const { valid, error, value } = validate(reportSchema, req.body);
    if (!valid) return res.status(400).json({ error });

    const { materialId, reason, brokenRules } = value;

    const existingReport = await Report.findOne({
        material: materialId,
        reportedBy: req.user.sub
    });

    if (existingReport) {
        return res.status(400).json({ error: "You have already reported this material." });
    }

    const lastReport = await Report.findOne({ reportedBy: req.user.sub })
        .sort({ createdAt: -1 })
        .select("createdAt");

    if (lastReport) {
        const secondsDiff = (Date.now() - new Date(lastReport.createdAt)) / 1000;
        if (secondsDiff < 120) {
            return res.status(429).json({ error: "Please wait before reporting again." });
        }
    }

    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ error: "Material not found" });

    const newReport = await Report.create({
        material: materialId,
        reportedBy: req.user.sub,
        reason,
        brokenRules
    });

    res.status(201).json({ message: "Report submitted successfully", report: newReport });
};

export const getMyReports = async (req, res) => {
    const reports = await Report.find({ reportedBy: req.user.sub })
        .populate("material", "title")
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json({ reports });
};

export const getPendingReports = async (req, res) => {
    const pendingReports = await Report.find({ status: "pending" })
        .populate("material", "title fileUrl program branch semester uploadedBy")
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json({ pendingReports });
};

export const handleReport = async (req, res) => {
    const { action, comment } = req.body;
    const validActions = ["accept", "reject"];

    if (!validActions.includes(action)) {
        return res.status(400).json({ error: "Invalid action. Use 'accept' or 'reject'." });
    }

    const report = await Report.findById(req.params.id).populate("material reportedBy");
    if (!report) return res.status(404).json({ error: "Report not found" });
    if (report.status !== "pending") return res.status(400).json({ error: "Report already reviewed" });

    report.status = action === "accept" ? "accepted" : "rejected";
    report.reviewedBy = req.user.sub;
    report.moderatorComment = comment || "";
    await report.save();

    // If accepted, delete the material and notify the uploader
    if (action === "accept") {
        const material = await Material.findById(report.material._id);
        if (material) {
            try {
                const publicId = getPublicId(material.fileUrl);
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error("Cloudinary deletion failed:", err);
            }

            await Material.deleteOne({ _id: material._id });

            await Notification.create({
                user: material.uploadedBy,
                type: "material_deleted",
                message: `Your upload titled "${material.title}" was removed for violating community guidelines.`,
                relatedMaterial: material._id
            });
        }
    }

    await Notification.create({
        user: report.reportedBy._id,
        type: `report_${action}`,
        message: `Your report for "${report.material.title}" was ${action}ed.`,
        relatedMaterial: report.material._id
    });

    res.status(200).json({ message: `Report ${action}ed successfully` });
};
