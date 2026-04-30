import { getNotificationsService, markOneReadService, markAllReadService } from "../services/notificationService.js";

// ================= GET NOTIFICATIONS =================
export const getNotifications = async (req, res) => {
    try {
        const notifications = await getNotificationsService(req.user._id);
        res.json(notifications);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

// ================= MARK ONE AS READ =================
export const markOneRead = async (req, res) => {
    try {
        await markOneReadService(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

// ================= MARK ALL AS READ =================
export const markAllRead = async (req, res) => {
    try {
        await markAllReadService(req.user._id);
        res.json({ success: true });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};
