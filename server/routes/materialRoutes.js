import express from "express";
import multer from "multer";
import { storage } from "../cloudinary/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/verifyToken.js";
import {
    uploadMaterial,
    deleteMaterial,
    getMaterials,
    getMyUploads,
    toggleUpvote
} from "../controllers/materialController.js";

const router = express.Router();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

router.post("/materials", verifyToken, upload.single("file"), asyncHandler(uploadMaterial));
router.delete("/materials/:id", verifyToken, asyncHandler(deleteMaterial));
router.get("/materials", asyncHandler(getMaterials));
router.get("/materials/myuploads", verifyToken, asyncHandler(getMyUploads));
router.post("/materials/:id/upvote", verifyToken, asyncHandler(toggleUpvote));

export default router;
