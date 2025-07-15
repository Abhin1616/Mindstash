import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
    const token = req.cookies.acc_token;
    if (!token) return res.status(403).json({ message: "Log in first" });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        const msg = err.name === "TokenExpiredError"
            ? "Token expired. Log in again."
            : "Invalid token";
        res.status(403).json({ message: msg });
    }
};
