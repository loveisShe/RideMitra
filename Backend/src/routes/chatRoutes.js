import express from "express";
import { getMessages, sendMessage } from "../controller/chatController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js"; // Bug #12
import { sendMessageSchema } from "../Lib/validators.js"; // Bug #12

const router = express.Router();

// GET  /api/v4/chat/:bookingId  → fetch full chat history
// POST /api/v4/chat/:bookingId  → send a message (REST fallback)
router.get("/:bookingId",  authMiddleware, getMessages);
// Bug #12 fix: validate message body before it reaches the service
router.post("/:bookingId", authMiddleware, validate(sendMessageSchema), sendMessage);

export default router;
