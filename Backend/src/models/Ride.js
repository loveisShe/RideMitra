import prisma from "../Lib/prismaClient.js";

const Ride = {

    // ── Find ──────────────────────────────────────────────────

    findById: (id) =>
        prisma.ride.findUnique({ where: { id: parseInt(id) } }),

    findAll: (where = {}) =>
        prisma.ride.findMany({
            where,
            include: {
                driver: { select: { id: true, name: true, email: true, profilePicture: true } }
            },
            orderBy: { createdAt: "desc" }
        }),

    findByDriver: (driverId) =>
        prisma.ride.findMany({
            where: { driverId: parseInt(driverId) },
            orderBy: { createdAt: "desc" }
        }),

    findByDriverWithPassengers: (driverId) =>
        prisma.ride.findMany({
            where: { driverId: parseInt(driverId) },
            orderBy: { date: "desc" },
            include: {
                bookings: {
                    include: {
                        passenger: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        }),

    // ── Create ────────────────────────────────────────────────

    create: (data) =>
        prisma.ride.create({ data }),

    // ── Update ────────────────────────────────────────────────

    update: (id, data) =>
        prisma.ride.update({ where: { id: parseInt(id) }, data }),

    // ── Delete ────────────────────────────────────────────────

    delete: (id) =>
        prisma.ride.delete({ where: { id: parseInt(id) } }),
};

export default Ride;
