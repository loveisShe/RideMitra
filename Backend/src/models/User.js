import prisma from "../Lib/prismaClient.js";

const User = {

    // ── Find ──────────────────────────────────────────────────

    findById: (id) =>
        prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true, name: true, email: true, phone: true,
                city: true, bio: true, role: true, profilePicture: true, createdAt: true
            }
        }),

    findByEmail: (email) =>
        prisma.user.findUnique({ where: { email } }),

    findAll: () =>
        prisma.user.findMany({ orderBy: { createdAt: "desc" } }),

    // ── Create ────────────────────────────────────────────────

    create: (data) =>
        prisma.user.create({ data }),

    // ── Update ────────────────────────────────────────────────

    update: (id, data) =>
        prisma.user.update({
            where: { id: parseInt(id) },
            data,
            select: {
                id: true, name: true, email: true, phone: true,
                city: true, bio: true, role: true, profilePicture: true
            }
        }),

    // ── Delete ────────────────────────────────────────────────

    delete: (id) =>
        prisma.user.delete({ where: { id: parseInt(id) } }),
};

export default User;
