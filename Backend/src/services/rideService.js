import prisma from "../Lib/prismaClient.js";

// ================= POST RIDE =================
export const postRideService = async ({ pickup, destination, date, time, vehicleType, fare, seats, amenities, userId }) => {
    if (!pickup || !destination || !date || !time || !fare || !seats) {
        throw { status: 400, message: "Missing required fields: pickup, destination, date, time, fare, seats" };
    }

    return await prisma.ride.create({
        data: {
            driverId:    parseInt(userId),
            pickup,
            destination,
            date:        new Date(date),
            time,
            vehicleType: vehicleType || null,
            fare:        parseFloat(fare),
            seats:       parseInt(seats),
            amenities:   amenities || []
        }
    });
};

// ================= GET ALL RIDES =================
export const getAllRidesService = async ({ pickup, destination, date }) => {
    const where = {};

    where.status = "pending";

    if (pickup)      where.pickup      = { contains: pickup,      mode: "insensitive" };
    if (destination) where.destination = { contains: destination, mode: "insensitive" };

    if (date) {
        const dayStart = new Date(date);
        dayStart.setUTCHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
        where.date = { gte: dayStart, lt: dayEnd };
    } else {
        where.date = { gte: new Date() };
    }

    return await prisma.ride.findMany({
        where,
        include: { driver: { select: { id: true, name: true, email: true, profilePicture: true } } },
        orderBy: { createdAt: "desc" }
    });
};

// ================= UPDATE SEATS =================
export const updateRideSeatsService = async (rideId, bookedSeats = 1, callerId) => {
    const ride = await prisma.ride.findUnique({ where: { id: parseInt(rideId) } });
    if (!ride) throw { status: 404, message: "Ride not found" };

    if (ride.driverId !== parseInt(callerId)) {
        throw { status: 403, message: "Forbidden: You are not the driver of this ride" };
    }

    try {
        return await prisma.ride.update({
            where: { id: parseInt(rideId), seats: { gte: parseInt(bookedSeats) } },
            data:  { seats: { decrement: parseInt(bookedSeats) } }
        });
    } catch {
        throw { status: 400, message: "Not enough seats available" };
    }
};

// ================= CANCEL RIDE =================
export const cancelRideService = async (rideId, driverId) => {
    const ride = await prisma.ride.findUnique({
        where: { id: parseInt(rideId) },
        include: {
            bookings: {
                where: { status: { in: ["pending", "accepted"] } },
                include: { passenger: { select: { id: true, name: true } } }
            }
        }
    });

    if (!ride) throw { status: 404, message: "Ride not found" };

    if (ride.driverId !== parseInt(driverId)) {
        throw { status: 403, message: "Forbidden: You are not the driver of this ride" };
    }

    if (ride.status === "completed" || ride.status === "cancelled") {
        throw { status: 400, message: `Ride is already ${ride.status}` };
    }

    await prisma.$transaction(async (tx) => {
        await tx.ride.update({
            where: { id: parseInt(rideId) },
            data:  { status: "cancelled" }
        });

        if (ride.bookings.length) {
            await tx.booking.updateMany({
                where: {
                    rideId: parseInt(rideId),
                    status: { in: ["pending", "accepted"] }
                },
                data: { status: "cancelled" }
            });

            const notifications = ride.bookings.map(b => ({
                userId:    b.passengerId,
                message:   `Your booking for ${ride.pickup} → ${ride.destination} was cancelled by the driver.`,
                type:      "rejected",
                bookingId: b.id
            }));
            await tx.notification.createMany({ data: notifications });
        }
    });

    if (global.io && ride.bookings.length) {
        ride.bookings.forEach(b => {
            global.io.to(b.passengerId.toString()).emit("new-notification", {
                message: `Your booking for ${ride.pickup} → ${ride.destination} was cancelled by the driver.`
            });
            global.io.to(b.passengerId.toString()).emit("booking-updated", { status: "cancelled" });
        });
    }

    return { message: "Ride cancelled successfully" };
};
