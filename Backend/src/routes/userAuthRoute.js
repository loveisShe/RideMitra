import express from "express";
import { registerUser, loginUser, googleLogin, getUserById, updateUser, deleteUser } from "../controller/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { uploadProfilePic } from "../Lib/cloudinary.js";
import rateLimit from "express-rate-limit";
import { validate } from "../middlewares/validate.js"; // Bug #12
import { registerSchema, loginSchema, updateProfileSchema } from "../Lib/validators.js"; // Bug #12

// Bug #16 fix: rate limit auth routes to prevent brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts. Please try again after 15 minutes." }
});

const router = express.Router();

// ================= AUTH =================
router.post("/register",     authLimiter, validate(registerSchema), registerUser);
router.post("/login",        authLimiter, validate(loginSchema), loginUser);
router.post("/google-login", googleLogin);

// ================= USER =================
router.get("/me",             authMiddleware, getUserById);
router.get("/get-user/:id",   authMiddleware, getUserById);
router.put("/update-profile",     authMiddleware, uploadProfilePic.single("profilePicture"), validate(updateProfileSchema), updateUser);
router.put("/update-profile/:id", authMiddleware, uploadProfilePic.single("profilePicture"), validate(updateProfileSchema), updateUser);
router.delete("/delete-user/:id", authMiddleware, deleteUser);

export default router;