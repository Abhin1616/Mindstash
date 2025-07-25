import express from "express";
import { completeProfile } from "../controllers/completeProfileController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/complete-profile", asyncHandler(completeProfile));

export default router;
