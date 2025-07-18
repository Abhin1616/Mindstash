import express from "express";
import multer from "multer";
import { storage } from "../cloudinary/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import requireRole from "../utils/requireRole.js";
import { verifyToken } from "../utils/verifyToken.js";
import {
    uploadMaterial,
    deleteMaterial,
    getMaterials,
    getMyUploads,
    toggleUpvote
} from "../controllers/materialController.js";
import requireCompletedProfile from "../utils/requireCompletedProfile.js";
import requireRole from "../utils/requireRole.js";

const router = express.Router();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

router.post("/materials", verifyToken, requireCompletedProfile, upload.single("file"), asyncHandler(uploadMaterial));
router.delete("/materials/:id", verifyToken, requireCompletedProfile, asyncHandler(deleteMaterial));
router.get("/materials", asyncHandler(getMaterials));
router.get("/materials/myuploads", verifyToken, requireCompletedProfile, asyncHandler(getMyUploads));
router.post("/materials/:id/upvote", verifyToken, requireCompletedProfile, asyncHandler(toggleUpvote));
router.delete("materials/:id/mod", verifyToken, requireCompletedProfile, requireRole("moderator"), asyncHandler(deleteMaterialAsModerator));

export default router;
