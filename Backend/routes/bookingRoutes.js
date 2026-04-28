import express from "express";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import Ride from "../models/Ride.js";
const io = global.io;

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
    const passenger = await User.findById(booking.passengerId);

const requesterName = passenger?.name || "Someone";
    const notification = await Notification.create({    
      userId: ride.userId,
      message: `${requesterName} requested a ride`,
      message: "New booking request received",
      type: "request",
      bookingId: booking._id,
      requesterName: requesterName
    });

    // console.log("Notification created:", notification);

    // 🔥 SOCKET
    
    if (booking && booking.passengerId) {
  io.to(booking.passengerId.toString()).emit("new-notification", {
    message: "New booking request received"
  });
}

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

    console.log("Action received:", action);
    console.log("Booking ID:", req.params.id);

    // 1. Find booking first
    const booking = await Booking.findById(req.params.id).populate("passengerId");
    const requesterName = booking.passengerId.name;
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 2. Find ride safely
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
        userId: booking.passengerId,
        message: "Your booking is accepted",
        type: "accepted"
      });

    } else if (action === "reject") {

      booking.status = "rejected";

      await Notification.create({        
        userId: booking.passengerId,
        message: "Your booking is rejected",
        type: "rejected"
      });

    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    // 4. Save booking
    await booking.save();

    // 5. Return UPDATED booking (VERY IMPORTANT)
    res.json({
      message: "Updated successfully",
      booking
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;