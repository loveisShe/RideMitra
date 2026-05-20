import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ── Profile picture storage ──────────────────────────────────
const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "ridemitra/profiles",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }]
    }
});

// ── Multer instance with 5 MB limit ─────────────────────────
export const uploadProfilePic = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export default cloudinary;
