import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    required: true   // ✅ Fixed: was missing required
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true   // ✅ Fixed: was missing required
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  seatsRequested: {
    type: Number,
    required: true   // ✅ Fixed: was missing required
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);