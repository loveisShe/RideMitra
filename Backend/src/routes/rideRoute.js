import express from "express";
import { postRide, getAllRides, updateRideSeats } from "../controller/rideController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const rideRouter = express.Router();

rideRouter.post("/post-ride", authMiddleware, postRide);
rideRouter.get("/all-rides", getAllRides);
rideRouter.patch("/update-seats/:id", authMiddleware, updateRideSeats);

export default rideRouter;