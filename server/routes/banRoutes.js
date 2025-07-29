import express from "express";
import { requireRole } from "../utils/requireRole.js";
import { banUser, unbanUser } from "../controllers/banController.js";
import { verifyToken } from "../utils/verifyToken.js";
import requireCompletedProfile from "../utils/requireCompletedProfile.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/ban-user/:userId", verifyToken, requireCompletedProfile, requireRole("moderator"), asyncHandler(banUser));
router.post("/unban-user/:userId", verifyToken, requireCompletedProfile, requireRole("moderator"), asyncHandler(unbanUser));

export default router;
