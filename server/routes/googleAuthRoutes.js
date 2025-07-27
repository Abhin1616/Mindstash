import express from "express";
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
import passport from "passport";
import { handleGoogleRedirect } from "../controllers/googleAuthController.js";

const router = express.Router();

router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${process.env.VITE_API_URL}/login?error=email_already_registered`,
        session: false,
    }),
    handleGoogleRedirect
);

export default router;
