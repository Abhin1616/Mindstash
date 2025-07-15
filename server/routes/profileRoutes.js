import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/verifyToken.js";
import { getProfile, updateProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get("/profile", verifyToken, asyncHandler(getProfile));
router.patch("/profile", verifyToken, asyncHandler(updateProfile));

export default router;
