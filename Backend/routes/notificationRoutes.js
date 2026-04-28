import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middlewares/auth.js";  // ✅ CORRECT
const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification
      .find({ userId })
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; // 🔥 MUST BE THIS