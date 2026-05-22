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
export const markOneReadService = async (notifId) => {
    await prisma.notification.update({
        where: { id: parseInt(notifId) },
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
