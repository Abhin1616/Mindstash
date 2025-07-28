import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import passport from "passport"; // ✅ NEW
import RULES from "./config/rules.js";
import routes from "./routes/index.js";
import { storage } from "./cloudinary/index.js";
import PROGRAMS from "./config/programs.js";


// Load env variables
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
import "./googleAuth/index.js";
import completeProfileRoutes from "./routes/completeProfileRoutes.js";



const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [process.env.CLIENT_ORIGIN, 'http://localhost:5173']

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
app.set("trust proxy", 1);

app.use(cookieParser());
app.use(passport.initialize());

// Multer config (shared globally)
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
});
app.use((req, res, next) => {
    req.upload = upload;
    next();
});

// Routes
app.get("/rules", (req, res) => {
    res.status(200).json(RULES);
})
app.get("/programs", (req, res) => {
    res.status(200).json(PROGRAMS);
})

// ✅ Debug Upload Route — bypasses auth for testing uploads
app.post("/materials", (req, res, next) => {
    req.upload.single("file")(req, res, (err) => {
        if (err) return next(err);

        console.log("[DEBUG] Upload route hitTTTTT");
        console.log("File info:", req.file);
        console.log("Body fields:", req.body);

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        res.status(200).json({ message: "Upload successful", file: req.file });
    });
});

app.use(completeProfileRoutes);
app.use(routes);

// Error Handler
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

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});
