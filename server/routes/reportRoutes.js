import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/verifyToken.js";
import requireRole from "../utils/requireRole.js";

import {
    submitReport,
    getMyReports,
    getModerationReports,
    handleReport
} from "../controllers/reportController.js";
import { checkBannedUser } from "../utils/checkBannedUser.js";

const router = express.Router();

router.post("/reports", verifyToken, checkBannedUser, asyncHandler(submitReport));
router.get("/reports/myreports", verifyToken, checkBannedUser, asyncHandler(getMyReports));
router.get("/reports/moderation", verifyToken, requireRole("moderator"), asyncHandler(getModerationReports));
router.patch("/reports/:id/handle", verifyToken, requireRole("moderator"), asyncHandler(handleReport));

export default router;