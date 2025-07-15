import express from "express";
import { chatWithGemini } from "../controllers/aiChatController.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/ask-ai", verifyToken, chatWithGemini);

export default router;
