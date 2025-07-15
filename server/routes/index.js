import express from "express";

import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
import materialRoutes from "./materialRoutes.js";
import reportRoutes from "./reportRoutes.js";
import notificationRoutes from "./notificationRoutes.js";

const router = express.Router();

router.use(authRoutes);
router.use(profileRoutes);
router.use(materialRoutes);
router.use(reportRoutes);
router.use(notificationRoutes);

export default router;
