import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/verifyToken.js";
import requireRole from "../utils/requireRole.js";

import {
    submitReport,
    getMyReports,
    getPendingReports,
    handleReport
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/reports", verifyToken, asyncHandler(submitReport));
router.get("/reports/myreports", verifyToken, asyncHandler(getMyReports));
router.get("/reports/pending", verifyToken, requireRole("moderator"), asyncHandler(getPendingReports));
router.patch("/reports/:id/handle", verifyToken, requireRole("moderator"), asyncHandler(handleReport));

export default router;
