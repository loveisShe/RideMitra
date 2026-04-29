import Ride from "../models/Ride.js";

// CREATE RIDE
export const postRide = async (req, res) => {
    try {
        const {
            pickup,
            destination,
            date,
            time,
            vehicleType,
            fare,
            seats,
            amenities
        } = req.body;

        // ✅ Validate required fields before hitting the DB
        if (!pickup || !destination || !date || !time || !fare || !seats) {
            return res.status(400).json({
                message: "Missing required fields: pickup, destination, date, time, fare, seats"
            });
        }

        const newRide = await Ride.create({
            userId: req.user._id,
            pickup,
            destination,
            date,
            time,
            vehicleType,
            fare,
            seats,
            amenities
        });

        res.status(201).json({
            message: "Ride posted successfully!",
            ride: newRide
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// GET ALL RIDES
export const getAllRides = async (req, res) => {
    try {
        const { pickup, destination, date } = req.query;

        let query = {};

        if (pickup) {
            query.pickup = { $regex: pickup, $options: "i" }; // case-insensitive match
        }

        if (destination) {
            query.destination = { $regex: destination, $options: "i" };
        }

        if (date) {
            query.date = date;
        }

        const rides = await Ride.find(query).populate("userId");

        res.json(rides);
    } catch (error) {
        res.status(500).json({ message: "Error fetching rides" });
    }
};
// UPDATE SEATS 
export const updateRideSeats = async (req, res) => {
    try {
        const rideId = req.params.id;
        const { bookedSeats = 1 } = req.body; // ✅ default = 1

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        if (ride.seats >= bookedSeats) {
            ride.seats -= bookedSeats;
            await ride.save();

            res.status(200).json({ message: "Booking confirmed" });
        } else {
            res.status(400).json({ message: "Not enough seats available" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};