import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/verifyToken.js";
import {
    register,
    login,
    verifyTokenSuccess,
    logout
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/verify-token", verifyToken, verifyTokenSuccess);
router.get("/logout", verifyToken, logout);

export default router;
