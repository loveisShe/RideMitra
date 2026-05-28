import express from "express";
import { requestBooking, handleBooking, getMyRides, getMyRidesWithPassengers, getMyBookings, cancelBooking } from "../controller/bookingController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { requestBookingSchema, handleBookingSchema } from "../Lib/validators.js";

const router = express.Router();

router.post("/request-booking",         authMiddleware, validate(requestBookingSchema), requestBooking);
router.patch("/handle-booking/:id",     authMiddleware, validate(handleBookingSchema), handleBooking);
router.patch("/cancel/:id",             authMiddleware, cancelBooking);
router.get("/my-rides",                 authMiddleware, getMyRides);
router.get("/my-rides-with-passengers", authMiddleware, getMyRidesWithPassengers);
router.get("/my-bookings",              authMiddleware, getMyBookings);

export default router;