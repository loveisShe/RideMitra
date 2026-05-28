import express from "express";
import { registerUser, loginUser, googleLogin, googleOAuthCallback, getUserById, updateUser, deleteUser } from "../controller/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { uploadProfilePic } from "../Lib/cloudinary.js";
import rateLimit from "express-rate-limit";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema, updateProfileSchema } from "../Lib/validators.js";
import passport from "passport";

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
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

// ================= GOOGLE REDIRECT OAUTH =================
router.get("/auth/google",          passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));
router.get("/auth/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/?google_error=1" }), googleOAuthCallback);

// ================= USER =================
router.get("/me",                 authMiddleware, getUserById);
router.get("/get-user/:id",       authMiddleware, getUserById);
router.put("/update-profile",     authMiddleware, uploadProfilePic.single("profilePicture"), validate(updateProfileSchema), updateUser);
router.put("/update-profile/:id", authMiddleware, uploadProfilePic.single("profilePicture"), validate(updateProfileSchema), updateUser);
router.delete("/delete-user/:id", authMiddleware, deleteUser);

export default router;