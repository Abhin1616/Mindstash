import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/verifyToken.js";
import {
    getNotifications,
    markAllSeen
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/notifications", verifyToken, asyncHandler(getNotifications));
router.patch("/notifications/mark-all-seen", verifyToken, asyncHandler(markAllSeen));

export default router;
