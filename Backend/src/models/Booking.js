import prisma from "../Lib/prismaClient.js";

const Booking = {

    // ── Find ──────────────────────────────────────────────────

    findById: (id) =>
        prisma.booking.findUnique({
            where: { id: parseInt(id) },
            include: { passenger: true }
        }),

    findByPassenger: (passengerId) =>
        prisma.booking.findMany({
            where: { passengerId: parseInt(passengerId) },
            orderBy: { createdAt: "desc" },
            include: {
                ride: {
                    include: { driver: { select: { name: true } } }
                }
            }
        }),

    findByRide: (rideId) =>
        prisma.booking.findMany({
            where: { rideId: parseInt(rideId) },
            include: {
                passenger: { select: { id: true, name: true, email: true } }
            }
        }),

    // ── Create ────────────────────────────────────────────────

    create: (data) =>
        prisma.booking.create({ data }),

    // ── Update ────────────────────────────────────────────────

    update: (id, data) =>
        prisma.booking.update({ where: { id: parseInt(id) }, data }),

    // ── Delete ────────────────────────────────────────────────

    delete: (id) =>
        prisma.booking.delete({ where: { id: parseInt(id) } }),
};

export default Booking;
