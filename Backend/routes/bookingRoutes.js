import express from "express";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import Ride from "../models/Ride.js";
import User from "../models/User.js";
import { protect } from "../middlewares/auth.js";

const io = global.io;

const router = express.Router();

// ✅ REQUEST BOOKING
router.post("/request-booking", protect, async (req, res) => {
  try {
    const { rideId, seatsRequested } = req.body;

    if (!rideId || !seatsRequested) {
      return res.status(400).json({ message: "Missing rideId or seatsRequested" });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    const booking = await Booking.create({
      rideId,
      passengerId: req.user.id, // ✅ comes from protect middleware
      seatsRequested,
      status: "pending"
    });

    // 🔥 Get passenger name safely
    const passenger = await User.findById(booking.passengerId);
    const requesterName = passenger?.name || "Someone";

    // 🔥 Create notification for ride owner
    await Notification.create({
      userId: ride.userId,
      message: `${requesterName} requested a ride`,
      type: "request",
      bookingId: booking._id,
      requesterName
    });

    // 🔥 Send real-time notification to ride owner
    if (ride.userId && io) {
      io.to(ride.userId.toString()).emit("new-notification", {
        message: `${requesterName} requested a ride`
      });
    }

    res.json({ message: "Request sent to driver" });

  } catch (err) {
    console.error("REQUEST BOOKING ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ ACCEPT / REJECT BOOKING
router.patch("/handle-booking/:id", protect, async (req, res) => {
  try {
    const { action } = req.body;

    if (!action) {
      return res.status(400).json({ message: "Action is required" });
    }

    console.log("Action:", action);
    console.log("Booking ID:", req.params.id);

    // 1. Find booking safely
    const booking = await Booking.findById(req.params.id).populate("passengerId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const requesterName = booking.passengerId?.name || "Someone";

    // 2. Find ride
    const ride = await Ride.findById(booking.rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // 3. Handle action
    if (action === "accept") {

      if (ride.seats < booking.seatsRequested) {
        return res.status(400).json({ message: "Not enough seats" });
      }

      ride.seats -= booking.seatsRequested;
      await ride.save();

      booking.status = "accepted";

      await Notification.create({
        userId: booking.passengerId._id,
        message: `Your booking has been accepted`,
        type: "accepted",
        bookingId: booking._id
      });

      // 🔥 real-time notify passenger
      if (booking.passengerId?._id && io) {
        io.to(booking.passengerId._id.toString()).emit("new-notification", {
          message: `Your booking has been accepted`
        });
      }

    } else if (action === "reject") {

      booking.status = "rejected";

      await Notification.create({
        userId: booking.passengerId._id,
        message: `Your booking has been rejected`,
        type: "rejected",
        bookingId: booking._id
      });

      // 🔥 real-time notify passenger
      if (booking.passengerId?._id && io) {
        io.to(booking.passengerId._id.toString()).emit("new-notification", {
          message: `Your booking has been rejected`
        });
      }

    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    // 4. Save booking
    await booking.save();

    // 5. Send response
    res.json({
      message: "Updated successfully",
      booking
    });

  } catch (err) {
    console.error("HANDLE BOOKING ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;