import express from "express";
import { registerUser, loginUser, googleLogin, getUserById, updateUser, deleteUser } from "../controller/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ================= AUTH =================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);

// ================= USER =================
router.get("/me", authMiddleware, getUserById);
router.get("/get-user/:id", authMiddleware, getUserById);
router.put("/update-profile", authMiddleware, updateUser);
router.put("/update-profile/:id", authMiddleware, updateUser);
router.delete("/delete-user/:id", authMiddleware, deleteUser);

export default router;