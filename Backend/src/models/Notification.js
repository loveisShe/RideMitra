import prisma from "../Lib/prismaClient.js";

const Notification = {

    // ── Find ──────────────────────────────────────────────────

    findByUser: (userId) =>
        prisma.notification.findMany({
            where: { userId: parseInt(userId), read: false },
            orderBy: { createdAt: "desc" },
            include: { booking: { select: { id: true, status: true } } }
        }),

    findById: (id) =>
        prisma.notification.findUnique({ where: { id: parseInt(id) } }),

    // ── Create ────────────────────────────────────────────────

    create: (data) =>
        prisma.notification.create({ data }),

    // ── Update ────────────────────────────────────────────────

    markOneRead: (id) =>
        prisma.notification.update({
            where: { id: parseInt(id) },
            data: { read: true }
        }),

    markAllRead: (userId) =>
        prisma.notification.updateMany({
            where: { userId: parseInt(userId), read: false },
            data: { read: true }
        }),

    // ── Delete ────────────────────────────────────────────────

    delete: (id) =>
        prisma.notification.delete({ where: { id: parseInt(id) } }),
};

export default Notification;
