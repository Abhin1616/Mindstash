import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/verifyToken.js";
import {
    getNotifications,
    markAllSeen
} from "../controllers/notificationController.js";
import requireCompletedProfile from "../utils/requireCompletedProfile.js";
import { checkBannedUser } from "../utils/checkBannedUser.js";

const router = express.Router();

router.get("/notifications", verifyToken, requireCompletedProfile, checkBannedUser, asyncHandler(getNotifications));
router.patch("/notifications/mark-all-seen", verifyToken, requireCompletedProfile, checkBannedUser, asyncHandler(markAllSeen));

export default router;
