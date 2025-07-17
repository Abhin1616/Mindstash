import jwt from "jsonwebtoken";
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

export const handleGoogleRedirect = (req, res) => {
    const user = req.user;

    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // ✅ Set acc_token as httpOnly cookie
    res.cookie("acc_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in prod
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Optional: redirect to frontend to update UI with profile status
    const redirectURL = `http://localhost:5173/google-auth-success?profileCompleted=${user.profileCompleted}`;
    res.redirect(redirectURL);
};
