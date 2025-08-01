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
    toggleUpvote,
    deleteMaterialAsModerator,
    getMaterialById
} from "../controllers/materialController.js";
import requireCompletedProfile from "../utils/requireCompletedProfile.js";
import { checkBannedUser } from "../utils/checkBannedUser.js";
import MAX_MATERIAL_FILE_SIZE from "../config/materialFileSize.js";

const router = express.Router();
const upload = multer({
    storage,
    limits: { fileSize: MAX_MATERIAL_FILE_SIZE },
});

router.post("/materials", verifyToken, requireCompletedProfile, checkBannedUser, upload.single("file"), asyncHandler(uploadMaterial));
router.delete("/materials/:id", verifyToken, requireCompletedProfile, checkBannedUser, asyncHandler(deleteMaterial));
router.get("/materials", asyncHandler(getMaterials));
router.get("/materials/myuploads", verifyToken, requireCompletedProfile, checkBannedUser, asyncHandler(getMyUploads));
router.get("/materials/:id", verifyToken, requireCompletedProfile, requireRole("moderator"), asyncHandler(getMaterialById));
router.post("/materials/:id/upvote", verifyToken, requireCompletedProfile, checkBannedUser, asyncHandler(toggleUpvote));
router.delete("/materials/:id/mod", verifyToken, requireCompletedProfile, requireRole("moderator"), asyncHandler(deleteMaterialAsModerator));

export default router;
