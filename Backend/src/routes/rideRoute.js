import express from "express";
import { postRide, getAllRides, updateRideSeats } from "../controller/rideController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate, validateQuery } from "../middlewares/validate.js"; // Bug #12
import { postRideSchema, searchRideSchema } from "../Lib/validators.js"; // Bug #12

const rideRouter = express.Router();

// Bug #12 fix: apply validation middleware so raw input never reaches the service layer
rideRouter.post("/post-ride",         authMiddleware, validate(postRideSchema), postRide);
rideRouter.get("/all-rides",          validateQuery(searchRideSchema), getAllRides);
rideRouter.patch("/update-seats/:id", authMiddleware, updateRideSeats);

export default rideRouter;