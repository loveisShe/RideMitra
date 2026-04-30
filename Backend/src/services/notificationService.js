import Notification from "../models/Notification.js";

// ================= GET NOTIFICATIONS =================
export const getNotificationsService = async (userId) => {
    return await Notification
        .find({ userId, read: false })
        .sort({ createdAt: -1 });
};

// ================= MARK ONE AS READ =================
export const markOneReadService = async (notifId) => {
    await Notification.findByIdAndUpdate(notifId, { read: true });
};

// ================= MARK ALL AS READ =================
export const markAllReadService = async (userId) => {
    await Notification.updateMany({ userId, read: false }, { read: true });
};
