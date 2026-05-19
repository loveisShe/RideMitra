import { requestBookingService, handleBookingService, getMyRidesService, getMyRidesWithPassengersService, getMyBookingsService } from "../services/bookingService.js";

// ================= REQUEST BOOKING =================
export const requestBooking = async (req, res) => {
    try {
        const booking = await requestBookingService({
            rideId:         req.body.rideId,
            seatsRequested: req.body.seatsRequested,
            userId:         req.user.id             
        });
        res.json({ message: "Request sent to driver", booking });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

// ================= ACCEPT / REJECT =================
export const handleBooking = async (req, res) => {
    try {
        const booking = await handleBookingService({
            bookingId: req.params.id,
            action:    req.body.action,
            driverId:  req.user.id                  
        });
        res.json({ message: "Updated successfully", booking });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

// ================= MY RIDES (as driver) =================
export const getMyRides = async (req, res) => {
    try {
        const rides = await getMyRidesService(req.user.id); // ✅
        res.json(rides);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

// ================= MY RIDES WITH PASSENGERS =================
export const getMyRidesWithPassengers = async (req, res) => {
    try {
        const rides = await getMyRidesWithPassengersService(req.user.id); 
        res.json(rides);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

// ================= MY BOOKINGS (as passenger) =================
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await getMyBookingsService(req.user.id); 
        res.json(bookings);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
