import express from "express";
import { banUser, getUsersForModeration, unbanUser } from "../controllers/banController.js";
import { verifyToken } from "../utils/verifyToken.js";
import requireCompletedProfile from "../utils/requireCompletedProfile.js";
import asyncHandler from "../utils/asyncHandler.js";
import requireRole from "../utils/requireRole.js";

const router = express.Router();

router.patch("/unban-user/:userId", verifyToken, requireCompletedProfile, requireRole("moderator"), asyncHandler(unbanUser));
router.post("/ban-user/:userId", verifyToken, requireCompletedProfile, requireRole("moderator"), asyncHandler(banUser));
router.get("/users", verifyToken, requireCompletedProfile, requireRole("moderator"), asyncHandler(getUsersForModeration));

export default router;
