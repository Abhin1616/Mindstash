import Material from "../models/Material.js";
import UserModel from "../models/User.js";
import { cloudinary } from "../cloudinary/index.js";
import validate from "../utils/validate.js";
import uploadSchema from "../joiSchemas/uploadSchema.js";
import { isValidProgram, isValidBranch, isValidSemester } from "../utils/configValidate.js";
import getPublicId from "../utils/getPublicId.js";
import findOwnedMaterial from "../utils/findOwnedMaterial.js";
import Notification from "../models/Notification.js";

const normalize = val => val && val.toLowerCase() !== 'all' ? val : undefined;

export const uploadMaterial = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Request body cannot be empty" });
    }

    const { valid, error, value } = validate(uploadSchema, req.body);
    if (!valid) {
        if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename);
        return res.status(400).json({ error });
    }

    if (!req.file?.path || !req.file?.mimetype) {
        return res.status(400).json({ error: "File upload missing or failed" });
    }

    try {
        const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

        const user = await UserModel.findById(req.user.id).lean();
        if (!user) throw new Error("User not found");

        const material = await Material.create({
            title: value.title,
            description: value.description || "",
            fileUrl: req.file.path,
            fileType,
            program: user.program,
            branch: user.branch,
            semester: user.semester,
            uploadedBy: user._id
        });

        return res.status(201).json({ message: "Material uploaded successfully", material });

    } catch (err) {
        // 🧹 Clean up uploaded file if something failed after upload
        if (req.file?.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cloudErr) {
                console.error("Failed to clean up uploaded file:", cloudErr.message);
            }
        }

        console.error("Upload error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const deleteMaterial = async (req, res) => {
    const material = await findOwnedMaterial(req.params.id, req.user.id);
    if (!material) return res.status(404).json({ error: "Material not found or not owned by you" });

    const publicId = getPublicId(material.fileUrl);

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });

    if (result.result !== 'ok') {
        return res.status(500).json({
            error: "Failed to delete file from Cloudinary. Database unchanged.",
            cloudinaryResponse: result,
        });
    }

    await material.deleteOne();
    res.status(200).json({ message: "Material deleted successfully" });
};
export const deleteMaterialAsModerator = async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ error: "Material not found" });

    try {
        const publicId = getPublicId(material.fileUrl);
        await cloudinary.uploader.destroy(publicId);
        await Material.deleteOne({ _id: material._id });

        await Notification.create({
            user: material.uploadedBy,
            message: `Your upload titled "${material.title}" was removed by a moderator for violating community guidelines.`,
        });

        return res.status(200).json({ message: "Material deleted successfully by moderator" });
    } catch (err) {
        console.error("Error deleting material:", err);
        return res.status(500).json({ error: "Failed to delete material" });
    }
};


export const getMaterials = async (req, res) => {
    const { program, branch, semester, search, sort = 'recent', page = 1, limit = 10 } = req.query;
    const normalizedProgram = normalize(program);
    const normalizedBranch = normalize(branch);
    const semesterNum = Number(semester);

    if (!normalizedProgram && (normalizedBranch || !isNaN(semesterNum)))
        return res.status(400).json({ error: "Program must be specified to filter by branch or semester" });

    if (normalizedProgram && !isValidProgram(normalizedProgram))
        return res.status(400).json({ error: "Invalid program" });

    if (normalizedBranch && !isValidBranch(normalizedProgram, normalizedBranch))
        return res.status(400).json({ error: "Invalid branch for selected program" });

    if (!isNaN(semesterNum) && (!normalizedProgram || !normalizedBranch || !isValidSemester(normalizedProgram, normalizedBranch, semesterNum)))
        return res.status(400).json({ error: "Invalid semester for selected program and branch" });

    const filter = {};
    if (normalizedProgram) filter.program = normalizedProgram;
    if (normalizedBranch) filter.branch = normalizedBranch;
    if (!isNaN(semesterNum)) filter.semester = semesterNum;
    if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [{ title: regex }, { description: regex }];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    if (sort === "top") {
        const pipeline = [
            { $match: filter },
            { $addFields: { upvoteCount: { $size: "$upvotes" } } },
            { $sort: { upvoteCount: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limitNum },
            {
                $lookup: {
                    from: "users",
                    localField: "uploadedBy",
                    foreignField: "_id",
                    as: "uploadedBy"
                }
            },
            { $unwind: "$uploadedBy" },
            {
                $project: {
                    title: 1, description: 1, fileUrl: 1, fileType: 1,
                    program: 1, branch: 1, semester: 1, createdAt: 1, upvotes: 1,
                    uploadedBy: { name: "$uploadedBy.name" }
                }
            }
        ];

        const [materials, totalCount] = await Promise.all([
            Material.aggregate(pipeline),
            Material.countDocuments(filter)
        ]);

        return res.status(200).json({ materials, totalCount, page: pageNum, totalPages: Math.ceil(totalCount / limitNum) });
    }

    const [materials, totalCount] = await Promise.all([
        Material.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('uploadedBy', 'name')
            .lean(),
        Material.countDocuments(filter)
    ]);

    res.status(200).json({ materials, totalCount, page: pageNum, totalPages: Math.ceil(totalCount / limitNum) });
};

export const getMyUploads = async (req, res) => {
    const myUploads = await Material.find({ uploadedBy: req.user.id }).lean();
    res.status(200).json(myUploads);
};

export const toggleUpvote = async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ error: "Material not found" });
    const userId = req.user.id;
    const alreadyUpvoted = material.upvotes.includes(userId);
    material.upvotes = alreadyUpvoted
        ? material.upvotes.filter(uid => uid.toString() !== userId)
        : [...material.upvotes, userId];
    await material.save();
    res.status(200).json({
        message: alreadyUpvoted ? "Upvote removed" : "Upvoted successfully",
        totalUpvotes: material.upvotes.length
    });
};
