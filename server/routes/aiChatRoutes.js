import express from "express";
import { chatWithGemini } from "../controllers/aiChatController.js";
import { verifyToken } from "../utils/verifyToken.js";
import { checkBannedUser } from "../utils/checkBannedUser.js";

const router = express.Router();

router.post("/ask-ai", verifyToken, checkBannedUser, chatWithGemini);

export default router;
