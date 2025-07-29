import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import validate from "../utils/validate.js";
import authCookieOptions from "../utils/cookieOptions.js";
import registerSchema from "../joiSchemas/registerSchema.js";
import loginSchema from "../joiSchemas/loginSchema.js";


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const generateToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const register = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Request body cannot be empty" });
    }
    const { valid, error } = validate(registerSchema, req.body);
    if (!valid) return res.status(400).json({ error });

    const { name, email, password, program, branch, semester } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            error: "Email is already registered",
        });
    }
    const user = new UserModel({ name, email, program, branch, semester, profileCompleted: true });
    const registeredUser = await UserModel.register(user, password);
    const token = generateToken(registeredUser);

    res.cookie("acc_token", token, authCookieOptions);
    res.status(201).json({ message: "Registration successful", userId: user._id });
};

export const login = async (req, res) => {
    const { valid, error } = validate(loginSchema, req.body);
    if (!valid) return res.status(400).json({ error });

    const user = await UserModel.findOne({ email: req.body.email }).select('+hash +salt');
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.hash || !user.salt) {
        return res.status(400).json({
            message: "This account was registered with Google. Please use 'Login with Google'.",
        });
    }

    if (user.isBanned) {
        return res.status(403).json({
            banned: true,
            message: "This account has been suspended for violating our community guidelines.",
        });
    }

    user.authenticate(req.body.password, (err, authenticatedUser) => {
        if (err || !authenticatedUser) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(authenticatedUser);
        res.cookie("acc_token", token, authCookieOptions);
        res.status(200).json({ message: "Login successful" });
    });
};


export const verifyTokenSuccess = async (req, res) => {
    try {
        const curUser = await UserModel.findById(req.user.id).select("role isBanned");
        if (!curUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const user = {
            userId: req.user.id,
            role: curUser.role,
            isBanned: curUser.isBanned,
        };
        res.status(200).json({ message: "Token valid", user });
    } catch (err) {
        console.error("Error verifying token:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = (req, res) => {
    res.clearCookie("acc_token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    });

    res.status(200).json({ message: "Logout successful" });
};
