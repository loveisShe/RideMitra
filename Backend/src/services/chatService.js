import prisma from "../Lib/prismaClient.js";

// ================= SEND MESSAGE =================
export const sendMessageService = async ({ bookingId, senderId, text }) => {
    const booking = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } });
    if (!booking) throw { status: 404, message: "Booking not found" };

    if (booking.status !== "accepted") {
        throw { status: 403, message: "Chat is only available for accepted bookings" };
    }

    const ride = await prisma.ride.findUnique({ where: { id: booking.rideId } });
    if (!ride) throw { status: 404, message: "Ride not found" };

    if (ride.status === "completed" || ride.status === "cancelled") {
        throw { status: 403, message: "Chat is disabled after the ride ends" };
    }

    const isPassenger = booking.passengerId === parseInt(senderId);
    const isDriver    = ride.driverId       === parseInt(senderId);
    if (!isPassenger && !isDriver) {
        throw { status: 403, message: "You are not part of this booking" };
    }

    const saved = await prisma.message.create({
        data: {
            bookingId: parseInt(bookingId),
            senderId:  parseInt(senderId),
            text:      text.trim().slice(0, 1000)
        },
        include: { sender: { select: { id: true, name: true } } }
    });

    // Bug #17 fix: emit the message to the Socket.IO room so real-time clients
    // receive messages sent through the REST fallback endpoint as well.
    if (global.io) {
        global.io.to(`chat:${bookingId}`).emit("chat-message", {
            id:        saved.id,
            bookingId: parseInt(bookingId),
            senderId:  { id: saved.sender.id, name: saved.sender.name },
            text:      saved.text,
            createdAt: saved.createdAt
        });
    }

    return saved;
};

// ================= GET MESSAGES =================
export const getMessagesService = async ({ bookingId, requesterId }) => {
    const booking = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } });
    if (!booking) throw { status: 404, message: "Booking not found" };

    const ride = await prisma.ride.findUnique({ where: { id: booking.rideId } });
    if (!ride) throw { status: 404, message: "Ride not found" };

    const isPassenger = booking.passengerId === parseInt(requesterId);
    const isDriver    = ride.driverId       === parseInt(requesterId);
    if (!isPassenger && !isDriver) {
        throw { status: 403, message: "You are not part of this booking" };
    }

    const messages = await prisma.message.findMany({
        where:   { bookingId: parseInt(bookingId) },
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true } } }
    });

    const isChatActive =
        booking.status === "accepted" &&
        ride.status !== "completed"   &&
        ride.status !== "cancelled";

    return { messages, isChatActive, rideStatus: ride.status, bookingStatus: booking.status };
};
