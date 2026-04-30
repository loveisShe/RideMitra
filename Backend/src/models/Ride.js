import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  pickup: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String
  },
  fare: {
    type: Number,
    required: true
  },
  seats: {
    type: Number,
    required: true
  },
  amenities: {
    type: [String] 
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "completed", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Ride", rideSchema);