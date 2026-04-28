import express from "express";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import Ride from "../models/Ride.js";
import { io } from "../server.js";

const router = express.Router();

// ✅ REQUEST BOOKING
router.post("/request-booking", async (req, res) => {
  try {
    const { rideId, passengerId, seatsRequested } = req.body;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    const booking = await Booking.create({
      rideId,
      passengerId,
      driverId: ride.userId,
      seatsRequested,
      status: "pending"
    });

    // 🔥 FIXED
    const notification = await Notification.create({
      userId: ride.userId,
      message: "New booking request received",
      type: "request",
      bookingId: booking._id
    });

    console.log("Notification created:", notification);

    // 🔥 SOCKET
    io.to(ride.userId.toString()).emit("new-notification", {
      message: "New booking request received"
    });

    res.json({ message: "Request sent to driver" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ ACCEPT / REJECT
router.patch("/handle-booking/:id", async (req, res) => {
  try {
    const { action } = req.body;

    const booking = await Booking.findById(req.params.id);
    const ride = await Ride.findById(booking.rideId);

    if (!booking || !ride) {
      return res.status(404).json({ message: "Data not found" });
    }

    if (action === "accept") {

      if (ride.seats < booking.seatsRequested) {
        return res.json({ message: "Not enough seats" });
      }

      ride.seats -= booking.seatsRequested;
      await ride.save();

      booking.status = "accepted";

      await Notification.create({
        userId: booking.passengerId,
        message: "Your booking is accepted",
        type: "accepted"
      });

    } else {
      booking.status = "rejected";

      await Notification.create({
        userId: booking.passengerId,
        message: "Your booking is rejected",
        type: "rejected"
      });
    }

    await booking.save();

    res.json({ message: "Updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;