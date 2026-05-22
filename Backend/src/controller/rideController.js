import { postRideService, getAllRidesService, updateRideSeatsService } from "../services/rideService.js";

// ================= POST RIDE =================
export const postRide = async (req, res) => {
    try {
        const ride = await postRideService({ ...req.body, userId: req.user.id }); 
        res.status(201).json({ message: "Ride posted successfully!", ride });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

// ================= GET ALL RIDES =================
export const getAllRides = async (req, res) => {
    try {
        // Bug #12 fix: use req.validatedQuery (set by validateQuery middleware)
        const rides = await getAllRidesService(req.validatedQuery || req.query);
        res.json(rides);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

// ================= UPDATE SEATS =================
export const updateRideSeats = async (req, res) => {
    try {
        // Bug #6 fix: pass caller ID so the service can verify ownership
        const ride = await updateRideSeatsService(req.params.id, req.body.bookedSeats, req.user.id);
        res.status(200).json({ message: "Booking confirmed", ride });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};