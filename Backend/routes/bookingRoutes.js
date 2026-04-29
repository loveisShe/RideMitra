import express from "express";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import Ride from "../models/Ride.js";
import User from "../models/User.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();
// global.io is used inline below so it's always read after server.js sets it

// ================= REQUEST BOOKING =================
router.post("/request-booking", authMiddleware, async (req, res) => {
  try {
    const { rideId, seatsRequested } = req.body;

    if (!rideId || !seatsRequested) {
      return res.status(400).json({ message: "Missing rideId or seatsRequested" });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    const booking = await Booking.create({
      rideId,
      passengerId: req.user._id, // ✅ FIXED
      seatsRequested,
      status: "pending"
    });

    const passenger = await User.findById(req.user._id);
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

    res.json({ message: "Request sent to driver" });

  } catch (err) {
    console.error("REQUEST BOOKING ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= ACCEPT / REJECT =================
router.patch("/handle-booking/:id", authMiddleware, async (req, res) => {
  try {
    const { action } = req.body;

    const booking = await Booking.findById(req.params.id).populate("passengerId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const ride = await Ride.findById(booking.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    // ✅ Only the driver who posted the ride can accept/reject bookings
    if (ride.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You are not the driver of this ride" });
    }


    if (action === "accept") {
      if (ride.seats < booking.seatsRequested) {
        return res.status(400).json({ message: "Not enough seats" });
      }

      ride.seats -= booking.seatsRequested;
      await ride.save();

      booking.status = "accepted";

      await Notification.create({
        userId: booking.passengerId._id,
        message: "Your booking has been accepted",
        type: "accepted",
        bookingId: booking._id
      });

      if (booking.passengerId?._id && global.io) {
        global.io.to(booking.passengerId._id.toString()).emit("new-notification", {
          message: "Your booking has been accepted"
        });
      }

    } else if (action === "reject") {

      booking.status = "rejected";

      await Notification.create({
        userId: booking.passengerId._id,
        message: "Your booking has been rejected",
        type: "rejected",
        bookingId: booking._id
      });

      if (booking.passengerId?._id && global.io) {
        global.io.to(booking.passengerId._id.toString()).emit("new-notification", {
          message: "Your booking has been rejected"
        });
      }

    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await booking.save();

    res.json({ message: "Updated successfully", booking });

  } catch (err) {
    console.error("HANDLE BOOKING ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= MY POSTED RIDES =================
router.get("/my-rides", authMiddleware, async (req, res) => {
    try {
        const rides = await Ride.find({ userId: req.user._id });
        res.json(rides);
    } catch (err) {
        res.status(500).json({ message: "Error fetching rides" });
    }
});

// ================= MY BOOKINGS =================
router.get("/my-bookings", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ passengerId: req.user._id })
      .populate({
        path: "rideId",
        populate: {
          path: "userId",
          select: "name"
        }
      });

    const formatted = bookings.map(b => ({
      pickup: b.rideId?.pickup,
      destination: b.rideId?.destination,
      fare: b.rideId?.fare,
      driverName: b.rideId?.userId?.name || "Driver",
      status: b.status
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

export default router;