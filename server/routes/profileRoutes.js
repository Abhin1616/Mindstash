import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/verifyToken.js";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import requireCompletedProfile from "../utils/requireCompletedProfile.js";
import { checkBannedUser } from "../utils/checkBannedUser.js";

const router = express.Router();

router.get("/profile", verifyToken, requireCompletedProfile, checkBannedUser, asyncHandler(getProfile));
router.patch("/profile", verifyToken, requireCompletedProfile, checkBannedUser, asyncHandler(updateProfile));

export default router;
