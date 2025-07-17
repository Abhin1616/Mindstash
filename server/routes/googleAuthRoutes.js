import express from "express";
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
        failureRedirect: "http://localhost:5173/login?error=email_already_registered",
        session: false,
    }),
    handleGoogleRedirect
);

export default router;
