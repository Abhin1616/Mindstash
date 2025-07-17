import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { completeProfile } from "../controllers/completeProfileController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/complete-profile", verifyToken, asyncHandler(completeProfile));

export default router;
