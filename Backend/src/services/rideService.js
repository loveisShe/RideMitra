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

    if (pickup)      where.pickup      = { contains: pickup,      mode: "insensitive" };
    if (destination) where.destination = { contains: destination, mode: "insensitive" };
    if (date)        where.date        = { gte: new Date(date), lt: new Date(new Date(date).getTime() + 86400000) };

    return await prisma.ride.findMany({
        where,
        include: { driver: { select: { id: true, name: true, email: true, profilePicture: true } } },
        orderBy: { createdAt: "desc" }
    });
};

// ================= UPDATE SEATS =================
export const updateRideSeatsService = async (rideId, bookedSeats = 1) => {
    const ride = await prisma.ride.findUnique({ where: { id: parseInt(rideId) } });
    if (!ride) throw { status: 404, message: "Ride not found" };

    if (ride.seats < bookedSeats) {
        throw { status: 400, message: "Not enough seats available" };
    }

    return await prisma.ride.update({
        where: { id: parseInt(rideId) },
        data:  { seats: ride.seats - bookedSeats }
    });
};
