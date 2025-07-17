import express from "express";
import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
import materialRoutes from "./materialRoutes.js";
import reportRoutes from "./reportRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import aiChatRoutes from "./aiChatRoutes.js";
import googleAuthRoutes from "./googleAuthRoutes.js";
import completeProfileRoutes from "./completeProfileRoutes.js"

const router = express.Router();

router.use(authRoutes);
router.use(profileRoutes);
router.use(materialRoutes);
router.use(reportRoutes);
router.use(notificationRoutes);
router.use(aiChatRoutes);
router.use(googleAuthRoutes);
router.use(completeProfileRoutes);

export default router;
