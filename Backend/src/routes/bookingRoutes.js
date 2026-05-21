import express from "express";
import { requestBooking, handleBooking, getMyRides, getMyRidesWithPassengers, getMyBookings } from "../controller/bookingController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js"; // Bug #12
import { requestBookingSchema, handleBookingSchema } from "../Lib/validators.js"; // Bug #12

const router = express.Router();

// Bug #12 fix: apply validation so raw input never reaches the service layer
router.post("/request-booking",         authMiddleware, validate(requestBookingSchema), requestBooking);
router.patch("/handle-booking/:id",     authMiddleware, validate(handleBookingSchema), handleBooking);
router.get("/my-rides",                 authMiddleware, getMyRides);
router.get("/my-rides-with-passengers", authMiddleware, getMyRidesWithPassengers);
router.get("/my-bookings",              authMiddleware, getMyBookings);

export default router;