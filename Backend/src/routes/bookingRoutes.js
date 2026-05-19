import express from "express";
import { requestBooking, handleBooking, getMyRides, getMyRidesWithPassengers, getMyBookings } from "../controller/bookingController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/request-booking",         authMiddleware, requestBooking);
router.patch("/handle-booking/:id",     authMiddleware, handleBooking);
router.get("/my-rides",                 authMiddleware, getMyRides);
router.get("/my-rides-with-passengers", authMiddleware, getMyRidesWithPassengers);
router.get("/my-bookings",              authMiddleware, getMyBookings);

export default router;