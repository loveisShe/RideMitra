import express from "express";
import { getNotifications, markOneRead, markAllRead } from "../controller/notificationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/",                authMiddleware, getNotifications);
router.patch("/mark-read/:id", authMiddleware, markOneRead);
router.patch("/mark-all-read", authMiddleware, markAllRead);

export default router;