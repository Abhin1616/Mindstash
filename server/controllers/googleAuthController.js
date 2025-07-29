import jwt from "jsonwebtoken";
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
export const handleGoogleRedirect = (req, res) => {
    const user = req.user;

    if (user.isBanned) {
        res.clearCookie("acc_token");
        const redirectURL = `${process.env.CLIENT_ORIGIN}/google-auth-success?banned=true`;
        return res.redirect(redirectURL);
    }


    if (!user.profileCompleted) {
        res.clearCookie("acc_token");
    } else {
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.cookie("acc_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    const redirectURL = `${process.env.CLIENT_ORIGIN}/google-auth-success?profileCompleted=${user.profileCompleted}&userId=${user._id}`;
    res.redirect(redirectURL);
};
