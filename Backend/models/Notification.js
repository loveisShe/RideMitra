import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  type: String, // request / accepted / rejected
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);