import express from "express";
import Notification from "../models/Notification.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ================= GET NOTIFICATIONS =================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification
      .find({ userId: req.user._id, read: false })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= MARK ONE AS READ =================
router.patch("/mark-read/:id", authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= MARK ALL AS READ =================
router.patch("/mark-all-read", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;