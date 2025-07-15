import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

import routes from "./routes/index.js";
import { storage } from "./cloudinary/index.js";

// Load env variables
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

// Multer config (shared globally)
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});
app.use((req, res, next) => {
    req.upload = upload;
    next();
});

// All routes
app.use(routes);

// Error handler
app.use((err, req, res, next) => {
    if (err.message?.includes("Unexpected field")) {
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

// Connect DB & start server
mongoose
    .connect(MONGODB_URL)
    .then(() => {
        console.log("✅ MongoDB connected");
        app.listen(PORT, () => console.log(`🚀 Server running at PORT ${PORT}`));
    })
    .catch((err) => {
        console.log("❌ MongoDB connection error:", err);
    });
