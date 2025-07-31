import Report from "../models/Report.js";
import Material from "../models/Material.js";
import Notification from "../models/Notification.js";
import validate from "../utils/validate.js";
import reportSchema from "../joiSchemas/reportSchema.js";
import getPublicId from "../utils/getPublicId.js";
import cloudinary from "cloudinary";
import handleReportSchema from "../joiSchemas/handleReportSchema.js";
import RULES from "../config/rules.js";


export const getMyReports = async (req, res) => {
    const reports = await Report.find({ reportedBy: req.user.id })
        .sort({ createdAt: -1 })
        .populate("material");
    const result = reports.map(report => ({
        _id: report._id,
        status: report.status,
        materialId: report.material?._id || null,
        isMaterialDeleted: !report.material,
        materialTitle: report.material?.title || report.materialSnapshot?.title || "Unknown",
        snapshot: report.materialSnapshot,
        createdAt: report.createdAt,
        reason: report.reason,
        brokenRules: report.brokenRules,
        moderatorComment: report.moderatorComment
    }));

    res.status(200).json(result);
};

export const submitReport = async (req, res) => {
    const { valid, error, value } = validate(reportSchema, req.body);
    if (!valid) return res.status(400).json({ error });

    const { materialId, reason, brokenRules } = value;

    const existingReport = await Report.findOne({
        material: materialId,
        reportedBy: req.user.id
    });

    if (existingReport) {
        return res.status(400).json({ error: "You have already reported this material." });
    }

    const lastReport = await Report.findOne({ reportedBy: req.user.id })
        .sort({ createdAt: -1 })
        .select("createdAt");
    if (lastReport) {
        const secondsDiff = (Date.now() - new Date(lastReport.createdAt)) / 1000;
        if (secondsDiff < 180) {
            return res.status(429).json({ error: "Please wait before reporting again." });
        }
    }

    const material = await Material.findById(materialId).populate("uploadedBy", "name");
    if (!material) return res.status(404).json({ error: "Material not found" });
    if (material.uploadedBy._id.toString() === req.user.id) {
        return res.status(400).json({ error: "You cannot report your own material." });
    }
    const materialSnapshot = {
        title: material.title,
        program: material.program,
        branch: material.branch,
        semester: material.semester,
        uploadedBy: {
            _id: material.uploadedBy._id,
            name: material.uploadedBy.name
        }
    };

    const newReport = await Report.create({
        material: materialId,
        materialSnapshot,
        reportedBy: req.user.id,
        reason,
        brokenRules
    });

    res.status(201).json({ message: "Report submitted successfully", report: newReport });
};

// ✅ Unified moderation route: /reports/moderation?status=pending|accepted|rejected|all
export const getModerationReports = async (req, res) => {
    const { status = "pending" } = req.query;
    const validStatuses = ["pending", "accepted", "rejected", "all"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status filter" });
    }

    const filter = status === "all" ? {} : { status };

    const reports = await Report.find(filter)
        .sort({ createdAt: -1 })
        .populate([
            { path: "material", populate: { path: "uploadedBy", select: "name email" } },
            { path: "reportedBy", select: "name email" },
            { path: "reviewedBy", select: "name" }
        ]);


    const filteredReports = reports.filter(report => {
        // Always exclude reports with deleted materials if their status is "pending"
        if (report.status === "pending" && !report.material) {
            return false;
        }
        return true;
    });

    const result = filteredReports.map(report => ({
        _id: report._id,
        status: report.status,
        reason: report.reason,
        brokenRules: report.brokenRules,
        moderatorComment: report.moderatorComment,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        reportedBy: report.reportedBy && {
            _id: report.reportedBy._id,
            name: report.reportedBy.name,
            email: report.reportedBy.email
        },
        reviewedBy: report.reviewedBy && {
            _id: report.reviewedBy._id,
            name: report.reviewedBy.name
        },
        materialId: report.material?._id || null,
        isMaterialDeleted: !report.material,
        materialTitle: report.material?.title || report.materialSnapshot?.title || "Unknown",
        snapshot: report.materialSnapshot,
        uploadedBy: report.material?.uploadedBy && {
            _id: report.material.uploadedBy._id,
            name: report.material.uploadedBy.name,
            email: report.material.uploadedBy.email
        }
    }));


    res.status(200).json(result);
};


export const handleReport = async (req, res) => {
    const { valid, error, value } = validate(handleReportSchema, req.body);
    if (!valid) return res.status(400).json({ error });

    const { action, comment } = req.body;
    const validActions = ["accept", "reject"];
    if (!validActions.includes(action)) {
        return res.status(400).json({ error: "Invalid action. Use 'accept' or 'reject'." });
    }

    const report = await Report.findById(req.params.id).populate("material reportedBy");
    if (!report) return res.status(404).json({ error: "Report not found" });
    if (report.status !== "pending") return res.status(400).json({ error: "Report already reviewed" });

    report.status = action === "accept" ? "accepted" : "rejected";
    report.reviewedBy = req.user.id;
    report.moderatorComment = comment || "";
    await report.save();

    // Try to delete the material if action is accept
    if (action === "accept" && report.material) {
        try {
            const material = report.material;
            const publicId = getPublicId(material.fileUrl);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
            await Material.deleteOne({ _id: material._id });

            const brokenRuleTitles = report.brokenRules?.map(id => {
                const rule = RULES.find(r => r.id === id);
                return rule ? rule.title : null;
            }).filter(Boolean);
            const ruleList = brokenRuleTitles.length ? ` Violated rules: ${brokenRuleTitles.join(", ")}.` : "";
            const message = `Your upload titled "${material.title}" was removed for violating community guidelines.${ruleList}`;

            await Notification.create({
                user: material.uploadedBy,
                type: "material_deleted",
                message,
                relatedMaterial: material._id
            });

        } catch (err) {
            console.error("Error deleting material:", err);
        }
    }

    // Always notify the reporter (if present)
    const materialTitle = report.material?.title || report.materialSnapshot?.title || "a material";
    const relatedMaterialId = report.material?._id || null;

    if (report.reportedBy?._id) {
        await Notification.create({
            user: report.reportedBy._id,
            type: `report_${action}`,
            message: `Your report for "${materialTitle}" was ${action}ed.`,
            relatedMaterial: relatedMaterialId
        });
    }

    res.status(200).json({ message: `Report ${action}ed successfully` });
};

