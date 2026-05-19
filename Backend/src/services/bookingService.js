import prisma from "../Lib/prismaClient.js";

// ================= REQUEST BOOKING =================
export const requestBookingService = async ({ rideId, seatsRequested, userId }) => {
    if (!rideId || !seatsRequested) {
        throw { status: 400, message: "Missing rideId or seatsRequested" };
    }

    const ride = await prisma.ride.findUnique({ where: { id: parseInt(rideId) } });
    if (!ride) throw { status: 404, message: "Ride not found" };

    const booking = await prisma.booking.create({
        data: {
            rideId: parseInt(rideId),
            passengerId: parseInt(userId),
            seatsRequested: parseInt(seatsRequested),
            status: "pending"
        }
    });

    const passenger = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    const requesterName = passenger?.name || "Someone";

    await prisma.notification.create({
        data: {
            userId: ride.driverId,
            message: `${requesterName} requested a ride`,
            type: "request",
            bookingId: booking.id
        }
    });

    if (ride.driverId && global.io) {
        global.io.to(ride.driverId.toString()).emit("new-notification", {
            message: `${requesterName} requested a ride`
        });
    }

    return booking;
};

// ================= ACCEPT / REJECT =================
export const handleBookingService = async ({ bookingId, action, driverId }) => {
    const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) },
        include: { passenger: true }
    });
    if (!booking) throw { status: 404, message: "Booking not found" };

    const ride = await prisma.ride.findUnique({ where: { id: booking.rideId } });
    if (!ride) throw { status: 404, message: "Ride not found" };

    if (ride.driverId !== parseInt(driverId)) {
        throw { status: 403, message: "Forbidden: You are not the driver of this ride" };
    }

    let newStatus;

    if (action === "accept") {
        if (ride.seats < booking.seatsRequested) {
            throw { status: 400, message: "Not enough seats" };
        }

        await prisma.ride.update({
            where: { id: ride.id },
            data: { seats: ride.seats - booking.seatsRequested }
        });

        newStatus = "accepted";

        await prisma.notification.create({
            data: {
                userId: booking.passengerId,
                message: "Your booking has been accepted! 🎉",
                type: "accepted",
                bookingId: booking.id
            }
        });

        if (global.io) {
            global.io.to(booking.passengerId.toString()).emit("new-notification", { message: "Your booking has been accepted! 🎉" });
            global.io.to(booking.passengerId.toString()).emit("booking-updated", { status: "accepted" });
        }

    } else if (action === "reject") {
        newStatus = "rejected";

        await prisma.notification.create({
            data: {
                userId: booking.passengerId,
                message: "Your booking has been rejected.",
                type: "rejected",
                bookingId: booking.id
            }
        });

        if (global.io) {
            global.io.to(booking.passengerId.toString()).emit("new-notification", { message: "Your booking has been rejected." });
            global.io.to(booking.passengerId.toString()).emit("booking-updated", { status: "rejected" });
        }

    } else {
        throw { status: 400, message: "Invalid action — use 'accept' or 'reject'" };
    }

    const updated = await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: { status: newStatus }
    });

    await prisma.notification.updateMany({
        where: { bookingId: booking.id, userId: parseInt(driverId), type: "request" },
        data: { read: true }
    });

    if (global.io) {
        global.io.to(driverId.toString()).emit("booking-updated", { status: action });
    }

    return updated;
};

// ================= MY RIDES =================
export const getMyRidesService = async (userId) => {
    return await prisma.ride.findMany({
        where: { driverId: parseInt(userId) },
        orderBy: { createdAt: "desc" }
    });
};

// ================= MY RIDES WITH PASSENGERS =================
export const getMyRidesWithPassengersService = async (userId) => {
    const rides = await prisma.ride.findMany({
        where: { driverId: parseInt(userId) },
        orderBy: { date: "desc" },
        include: {
            bookings: {
                include: { passenger: { select: { id: true, name: true, email: true } } }
            }
        }
    });

    return rides.map(ride => ({
        id: ride.id,
        pickup: ride.pickup,
        destination: ride.destination,
        date: ride.date,
        fare: ride.fare,
        seats: ride.seats,
        rideStatus: ride.status,
        bookings: ride.bookings.map(b => ({
            bookingId: b.id,
            passengerId: b.passenger?.id,
            passengerName: b.passenger?.name || "Passenger",
            seatsRequested: b.seatsRequested || 1,
            status: b.status || "pending"
        }))
    }));
};

// ================= MY BOOKINGS =================
export const getMyBookingsService = async (userId) => {
    const bookings = await prisma.booking.findMany({
        where: { passengerId: parseInt(userId) },
        orderBy: { createdAt: "desc" },
        include: {
            ride: {
                include: { driver: { select: { name: true } } }
            }
        }
    });

    return bookings.map(b => ({
        bookingId: b.id,
        pickup: b.ride?.pickup || "—",
        destination: b.ride?.destination || "—",
        date: b.ride?.date || null,
        fare: b.ride?.fare || 0,
        seatsRequested: b.seatsRequested || 1,
        driverName: b.ride?.driver?.name || "Driver",
        status: b.status || "pending",
        rideStatus: b.ride?.status || "pending"
    }));
};
