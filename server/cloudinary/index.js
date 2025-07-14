import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const allowedFormats = ['pdf', 'jpg', 'jpeg', 'png'];

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        const originalNameWithoutExt = file.originalname.split('.').slice(0, -1).join('.');
        const sanitizedFilename = originalNameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '');

        const isPDF = file.mimetype === 'application/pdf';
        const isImage = file.mimetype.startsWith('image/') && allowedFormats.includes(ext);

        if (!isPDF && !isImage) {
            console.warn("⚠️ Rejected file upload:", file.originalname, file.mimetype);
            throw new Error('Unsupported file type. Only PDF and images (JPG, JPEG, PNG) allowed.');
        }

        return {
            folder: 'mindstash-DB',
            public_id: `${Date.now()}-${sanitizedFilename}`,
            resource_type: 'auto', // ✅ Cloudinary chooses 'image' or 'raw'
            allowed_formats: allowedFormats
        };
    }
});

export { cloudinary, storage };
