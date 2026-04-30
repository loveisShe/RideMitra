import Ride from "../models/Ride.js";

// ================= POST RIDE =================
export const postRideService = async ({ pickup, destination, date, time, vehicleType, fare, seats, amenities, userId }) => {
    if (!pickup || !destination || !date || !time || !fare || !seats) {
        throw { status: 400, message: "Missing required fields: pickup, destination, date, time, fare, seats" };
    }

    return await Ride.create({ userId, pickup, destination, date, time, vehicleType, fare, seats, amenities });
};

// ================= GET ALL RIDES =================
export const getAllRidesService = async ({ pickup, destination, date }) => {
    const query = {};

    if (pickup)      query.pickup      = { $regex: pickup, $options: "i" };
    if (destination) query.destination = { $regex: destination, $options: "i" };
    if (date)        query.date        = date;

    return await Ride.find(query).populate("userId");
};

// ================= UPDATE SEATS =================
export const updateRideSeatsService = async (rideId, bookedSeats = 1) => {
    const ride = await Ride.findById(rideId);
    if (!ride) throw { status: 404, message: "Ride not found" };

    if (ride.seats < bookedSeats) {
        throw { status: 400, message: "Not enough seats available" };
    }

    ride.seats -= bookedSeats;
    await ride.save();

    return ride;
};
