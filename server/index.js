import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";

import loginSchema from "./joiSchemas/loginSchema.js";
import registerSchema from "./joiSchemas/registerSchema.js";
import uploadSchema from "./joiSchemas/uploadSchema.js";
import editSchema from "./joiSchemas/editSchema.js";

import UserModel from "./models/User.js";
import Material from "./models/Material.js";

import asyncHandler from "./utils/asyncHander.js";
import { storage } from "./cloudinary/index.js";
import { isValidProgram, isValidBranch, isValidSemester } from "./utils/configValidate.js";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const app = express();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

const generateToken = (user) => jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const verifyToken = (req, res, next) => {
    const token = req.cookies.acc_token;
    if (!token) return res.status(403).json({ message: 'Log in first' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        const msg = err.name === 'TokenExpiredError' ? 'Token expired. Log in again.' : 'Invalid token';
        res.status(403).json({ message: msg });
    }
};

const normalize = val => val && val.toLowerCase() !== 'all' ? val : undefined;

// Register
app.post("/register", asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0)
        return res.status(400).json({ error: "Request body is empty!" });

    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, password, program, branch, semester } = req.body;
    const user = new UserModel({ name, email, program, branch, semester });
    const registeredUser = await UserModel.register(user, password);
    const token = generateToken(registeredUser);

    res.cookie("acc_token", token, { httpOnly: true, sameSite: "Lax", secure: process.env.NODE_ENV === "production" });
    res.status(201).json({ message: "Registration successful" });
}));

// Login
app.post("/login", asyncHandler(async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    user.authenticate(req.body.password, (err, authenticatedUser) => {
        if (err || !authenticatedUser) return res.status(401).json({ message: "Invalid credentials" });

        const token = generateToken(authenticatedUser);
        res.cookie("acc_token", token, { httpOnly: true, sameSite: "Lax", secure: process.env.NODE_ENV === "production" });
        res.status(200).json({ message: "Login successful" });
    });
}));

// Token, Logout
app.get('/verify-token', verifyToken, (req, res) => res.status(200).json({ message: 'Token valid', user: req.user }));
app.get('/logout', verifyToken, (req, res) => {
    res.clearCookie('acc_token');
    res.status(200).json({ message: 'Logout successful' });
});

// Profile
app.get("/profile", verifyToken, asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user.sub).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, email, program, branch, semester } = user;
    res.status(200).json({ name, email, program, branch, semester });
}));

app.patch("/profile", verifyToken, asyncHandler(async (req, res) => {
    const { error, value } = editSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updatedUser = await UserModel.findByIdAndUpdate(req.user.sub, { $set: value }, { new: true, runValidators: true }).lean();
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    const { name, email, program, branch, semester } = updatedUser;
    res.status(200).json({ message: "Profile updated successfully", user: { name, email, program, branch, semester } });
}));

// Upload Material
app.post('/materials', verifyToken, upload.single('file'), asyncHandler(async (req, res) => {
    try {
        const { error, value } = uploadSchema.validate(req.body);
        if (error) {
            if (req.file?.filename) {
                const { cloudinary } = await import("./cloudinary/index.js");
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(400).json({
                error: "Validation failed",
                details: error.details.map(detail => ({
                    field: detail.context.key,
                    message: detail.message
                }))
            });
        }

        if (!req.file || !req.file.path || !req.file.mimetype) {
            return res.status(400).json({ error: "File upload missing or failed" });
        }

        const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

        const user = await UserModel.findById(req.user.sub).lean();
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

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

        res.status(201).json({
            message: "Material uploaded successfully",
            material
        });
    } catch (err) {
        if (req.file?.filename) {
            try {
                const { cloudinary } = await import("./cloudinary/index.js");
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cloudErr) {
                console.error("❌ Failed to delete orphaned Cloudinary file:", cloudErr);
            }
        }

        console.error("🔥 Upload failed:", err);
        res.status(500).json({ error: "Something went wrong while uploading material" });
    }
}));



// Get Materials
app.get('/materials', asyncHandler(async (req, res) => {
    const { program, branch, semester, search, sort = 'recent', page = 1, limit = 10 } = req.query;

    const normalizedProgram = normalize(program);
    const normalizedBranch = normalize(branch);
    const semesterNum = Number(semester);

    if (!normalizedProgram && (normalizedBranch || !isNaN(semesterNum))) {
        return res.status(400).json({ error: "Program must be specified to filter by branch or semester" });
    }

    if (normalizedProgram && !isValidProgram(normalizedProgram)) {
        return res.status(400).json({ error: "Invalid program" });
    }

    if (normalizedBranch && !isValidBranch(normalizedProgram, normalizedBranch)) {
        return res.status(400).json({ error: "Invalid branch for selected program" });
    }

    if (!isNaN(semesterNum)) {
        if (!normalizedProgram || !normalizedBranch) {
            return res.status(400).json({ error: "Program and branch must be specified to filter by semester" });
        }
        if (!isValidSemester(normalizedProgram, normalizedBranch, semesterNum)) {
            return res.status(400).json({ error: "Invalid semester for selected program and branch" });
        }
    }

    const filter = {};
    if (normalizedProgram) filter.program = normalizedProgram;
    if (normalizedBranch) filter.branch = normalizedBranch;
    if (!isNaN(semesterNum)) filter.semester = semesterNum;

    if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [{ title: regex }, { description: regex }];
    }

    const sortOption = sort === 'top' ? { upvotes: -1, createdAt: -1 } : { createdAt: -1 };
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [materials, totalCount] = await Promise.all([
        Material.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum)
            .populate('uploadedBy', 'name')
            .lean(),
        Material.countDocuments(filter)
    ]);

    res.status(200).json({ materials, totalCount, page: pageNum, totalPages: Math.ceil(totalCount / limitNum) });
}));

app.get('/materials/myuploads', verifyToken, asyncHandler(async (req, res) => {
    const myUploads = await Material.find({ uploadedBy: req.user.sub });
    res.status(200).json(myUploads);
}))

// Error Handling
app.use((err, req, res, next) => {
    if (err.message.includes('Unexpected field')) {
        return res.status(400).json({ error: "File upload failed", message: "Multiple files not allowed." });
    }
    if (err.name === "MulterError") {
        return res.status(400).json({ error: "File upload failed", message: err.message });
    }
    if (err.message === "Unsupported file type") {
        return res.status(400).json({ error: "File upload failed", message: "Only pdf/image files allowed." });
    }
    console.error("Unhandled Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});

// Connect DB & Start Server
mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log("Database connected successfully!");
        app.listen(PORT, () => console.log(`Server running at PORT ${PORT}`));
    })
    .catch((err) => console.log("DB Connection Error:", err));
