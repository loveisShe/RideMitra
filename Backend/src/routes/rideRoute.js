import express from "express";
import { postRide, getAllRides, updateRideSeats, cancelRide } from "../controller/rideController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate, validateQuery } from "../middlewares/validate.js"; // Bug #12
import { postRideSchema, searchRideSchema } from "../Lib/validators.js"; // Bug #12

const rideRouter = express.Router();

rideRouter.post("/post-ride",         authMiddleware, validate(postRideSchema), postRide);
rideRouter.get("/all-rides",          validateQuery(searchRideSchema), getAllRides);
rideRouter.patch("/update-seats/:id", authMiddleware, updateRideSeats);
rideRouter.patch("/cancel/:id",       authMiddleware, cancelRide);

export default rideRouter;