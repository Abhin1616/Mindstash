import jwt from "jsonwebtoken";
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
export const handleGoogleRedirect = (req, res) => {
    const user = req.user;

    if (!user.profileCompleted) {
        // Clear any previous token, if any
        res.clearCookie("acc_token");
    } else {
        // Set JWT cookie only if profile is complete
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.cookie("acc_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    // Frontend handles redirection logic
    const redirectURL = `${process.env.VITE_API_URL}/google-auth-success?profileCompleted=${user.profileCompleted}&userId=${user._id}`;

    res.redirect(redirectURL);
};
