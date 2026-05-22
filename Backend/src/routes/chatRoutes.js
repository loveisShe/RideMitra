import express from "express";
import { getMessages, sendMessage } from "../controller/chatController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET  /api/v4/chat/:bookingId  → fetch full chat history
// POST /api/v4/chat/:bookingId  → send a message (REST fallback)
router.get("/:bookingId",  authMiddleware, getMessages);
router.post("/:bookingId", authMiddleware, sendMessage);

export default router;
