import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    console.log("Fetching notifications for:", req.params.userId);

    const notifications = await Notification
      .find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    console.log("Found:", notifications.length);

    res.json(notifications);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;