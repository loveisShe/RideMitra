import prisma from "../Lib/prismaClient.js";

const Message = {

    // ── Find ──────────────────────────────────────────────────

    findByBooking: (bookingId) =>
        prisma.message.findMany({
            where: { bookingId: parseInt(bookingId) },
            orderBy: { createdAt: "asc" },
            include: {
                sender: { select: { id: true, name: true } }
            }
        }),

    findById: (id) =>
        prisma.message.findUnique({ where: { id: parseInt(id) } }),

    // ── Create ────────────────────────────────────────────────

    create: (data) =>
        prisma.message.create({ data }),

    // ── Delete ────────────────────────────────────────────────

    delete: (id) =>
        prisma.message.delete({ where: { id: parseInt(id) } }),

    deleteByBooking: (bookingId) =>
        prisma.message.deleteMany({ where: { bookingId: parseInt(bookingId) } }),
};

export default Message;
