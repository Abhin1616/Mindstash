import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import loginSchema from "./joiSchemas/loginSchema.js";
import registerSchema from "./joiSchemas/registerSchema.js";
import UserModel from "./models/User.js";
import asyncHandler from "./utils/asyncHander.js";
import Material from "./models/Material.js";
import uploadSchema from "./joiSchemas/uploadSchema.js";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🛡️ Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(cookieParser());

// 🔐 JWT Token Generator
const generateToken = (user) => {
    return jwt.sign(
        {
            sub: user._id,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// 📝 Register Route
app.post("/register", asyncHandler(async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body is empty!" });
        }

        const { error } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, email, password, program, branch, semester } = req.body;

        const user = new UserModel({
            name,
            email,
            program,
            branch,
            semester
        });

        const registeredUser = await UserModel.register(user, password);

        const token = generateToken(registeredUser);

        res.cookie("acc_token", token, {
            httpOnly: true,
            sameSite: "Lax",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(201).json({ message: "Registration successful" });
    } catch (err) {
        console.error(err);
        if (err.name === 'MongoServerError' && err.code === 11000) {
            const duplicateField = Object.keys(err.keyValue)[0];
            return res.status(400).json({ error: `${duplicateField} already exists` });
        }
        return res.status(400).json({ error: err.message });
    }
}));

//Login Route
app.post("/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const user = await UserModel.findOne({ email })
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    user.authenticate(password, (err, authenticatedUser) => {
        if (err || !authenticatedUser) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(authenticatedUser);
        res.cookie("acc_token", token, {
            httpOnly: true,
            sameSite: "Lax",
            secure: process.env.NODE_ENV === "production"
        });
        res.status(200).json({ message: "Login successful" });
    });
}));

// ✅ JWT Middleware
const verifyToken = (req, res, next) => {
    const token = req.cookies.acc_token;

    if (!token) {
        return res.status(403).json({ message: 'Log in first' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Token expired. Log in again.' });
        }
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// 🔍 Token Verification Route
app.get('/verify-token', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Token valid', user: req.user });
});

// 🚪 Logout Route
app.get('/logout', verifyToken, (req, res) => {
    res.clearCookie('acc_token');
    res.status(200).json({ message: 'Logout successful' });
});


//Profile Routes
app.get("/profile", verifyToken, asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user.sub).lean();
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const { name, email, program, branch, semester } = user;
    res.status(200).json({ name, email, program, branch, semester });
}))

app.patch("/profile", verifyToken, asyncHandler(async (req, res) => {
    const { error, value } = editSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { name, program, branch, semester } = value;
    const updatedUser = await UserModel.findByIdAndUpdate(
        req.user.sub,
        { $set: value }, // only set provided fields
        { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
    }

    const { email } = updatedUser;
    res.status(200).json({
        message: "Profile updated successfully",
        user: { name, email, program, branch, semester }
    });
}));



app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});


mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log("Database connected successfully!");
        app.listen(PORT, () => {
            console.log(`Server running at PORT ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(" DB Connection Error:", err);
    });

