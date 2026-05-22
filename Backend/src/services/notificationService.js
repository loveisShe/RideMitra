import prisma from "../Lib/prismaClient.js";

// ================= GET NOTIFICATIONS =================
export const getNotificationsService = async (userId) => {
    return await prisma.notification.findMany({
        where:   { userId: parseInt(userId), read: false },
        orderBy: { createdAt: "desc" },
        include: { booking: { select: { id: true, status: true } } }
    });
};

// ================= MARK ONE AS READ =================
// Bug #5 fix: userId is required to ensure a user can only mark their own notifications
export const markOneReadService = async (notifId, userId) => {
    await prisma.notification.updateMany({
        where: { id: parseInt(notifId), userId: parseInt(userId) },
        data:  { read: true }
    });
};

// ================= MARK ALL AS READ =================
export const markAllReadService = async (userId) => {
    await prisma.notification.updateMany({
        where: { userId: parseInt(userId), read: false },
        data:  { read: true }
    });
};
