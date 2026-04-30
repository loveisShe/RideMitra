import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import Ride from "../models/Ride.js";
import User from "../models/User.js";

// ================= REQUEST BOOKING =================
export const requestBookingService = async ({ rideId, seatsRequested, userId }) => {
    if (!rideId || !seatsRequested) {
        throw { status: 400, message: "Missing rideId or seatsRequested" };
    }

    const ride = await Ride.findById(rideId);
    if (!ride) throw { status: 404, message: "Ride not found" };

    const booking = await Booking.create({
        rideId,
        passengerId: userId,
        seatsRequested,
        status: "pending"
    });

    const passenger = await User.findById(userId);
    const requesterName = passenger?.name || "Someone";

    await Notification.create({
        userId: ride.userId,
        message: `${requesterName} requested a ride`,
        type: "request",
        bookingId: booking._id
    });

    if (ride.userId && global.io) {
        global.io.to(ride.userId.toString()).emit("new-notification", {
            message: `${requesterName} requested a ride`
        });
    }

    return booking;
};

// ================= ACCEPT / REJECT =================
export const handleBookingService = async ({ bookingId, action, driverId }) => {
    const booking = await Booking.findById(bookingId).populate("passengerId");
    if (!booking) throw { status: 404, message: "Booking not found" };

    const ride = await Ride.findById(booking.rideId);
    if (!ride) throw { status: 404, message: "Ride not found" };

    if (ride.userId.toString() !== driverId.toString()) {
        throw { status: 403, message: "Forbidden: You are not the driver of this ride" };
    }

    if (action === "accept") {
        if (ride.seats < booking.seatsRequested) {
            throw { status: 400, message: "Not enough seats" };
        }

        ride.seats -= booking.seatsRequested;
        await ride.save();
        booking.status = "accepted";

        await Notification.create({
            userId: booking.passengerId._id,
            message: "Your booking has been accepted! 🎉",
            type: "accepted",
            bookingId: booking._id
        });

        if (booking.passengerId?._id && global.io) {
            global.io.to(booking.passengerId._id.toString()).emit("new-notification", {
                message: "Your booking has been accepted! 🎉"
            });
            global.io.to(booking.passengerId._id.toString()).emit("booking-updated", { status: "accepted" });
        }

    } else if (action === "reject") {
        booking.status = "rejected";

        await Notification.create({
            userId: booking.passengerId._id,
            message: "Your booking has been rejected.",
            type: "rejected",
            bookingId: booking._id
        });

        if (booking.passengerId?._id && global.io) {
            global.io.to(booking.passengerId._id.toString()).emit("new-notification", {
                message: "Your booking has been rejected."
            });
            global.io.to(booking.passengerId._id.toString()).emit("booking-updated", { status: "rejected" });
        }

    } else {
        throw { status: 400, message: "Invalid action — use 'accept' or 'reject'" };
    }

    await booking.save();

    await Notification.findOneAndUpdate(
        { bookingId: booking._id, userId: driverId, type: "request" },
        { read: true }
    );

    if (global.io) {
        global.io.to(driverId.toString()).emit("booking-updated", { status: action });
    }

    return booking;
};

// ================= MY RIDES =================
export const getMyRidesService = async (userId) => {
    return await Ride.find({ userId });
};

// ================= MY RIDES WITH PASSENGERS =================
export const getMyRidesWithPassengersService = async (userId) => {
    const rides = await Ride.find({ userId }).sort({ date: -1 });

    return await Promise.all(
        rides.map(async (ride) => {
            const bookings = await Booking.find({ rideId: ride._id })
                .populate("passengerId", "name email");

            return {
                _id: ride._id,
                pickup: ride.pickup,
                destination: ride.destination,
                date: ride.date,
                fare: ride.fare,
                seats: ride.seats,
                bookings: bookings.map(b => ({
                    bookingId: b._id,
                    passengerName: b.passengerId?.name || "Passenger",
                    seatsRequested: b.seatsRequested || 1,
                    status: b.status || "pending"
                }))
            };
        })
    );
};

// ================= MY BOOKINGS =================
export const getMyBookingsService = async (userId) => {
    const bookings = await Booking.find({ passengerId: userId })
        .populate({
            path: "rideId",
            populate: { path: "userId", select: "name" }
        })
        .sort({ createdAt: -1 });

    return bookings.map(b => ({
        pickup: b.rideId?.pickup || "—",
        destination: b.rideId?.destination || "—",
        date: b.rideId?.date || null,
        fare: b.rideId?.fare || 0,
        seatsRequested: b.seatsRequested || 1,
        driverName: b.rideId?.userId?.name || "Driver",
        status: b.status || "pending"
    }));
};
