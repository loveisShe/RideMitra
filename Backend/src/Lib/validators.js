import { z } from "zod";

// ── User ─────────────────────────────────────────────────────
export const registerSchema = z.object({
    name:     z.string().min(2,  "Name must be at least 2 characters"),
    email:    z.string().email("Invalid email address"),
    password: z.string().min(6,  "Password must be at least 6 characters"),
    role:     z.enum(["Passenger", "Driver"]).optional()
});

export const loginSchema = z.object({
    email:    z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

export const updateProfileSchema = z.object({
    name:     z.string().min(2).optional(),
    phone:    z.string().regex(/^\+?[0-9\s\-]{7,15}$/, "Invalid phone number").optional(),
    city:     z.string().min(2).optional(),
    bio:      z.string().max(300, "Bio must be under 300 characters").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional()
}).strip();  // Strip unknown fields silently

// ── Ride ─────────────────────────────────────────────────────
export const postRideSchema = z.object({
    pickup:      z.string().min(2,  "Pickup location required"),
    destination: z.string().min(2,  "Destination required"),
    date:        z.string().refine(d => !isNaN(Date.parse(d)), "Invalid date format"),
    time:        z.string().regex(/^\d{1,2}:\d{2}$/, "Time must be HH:MM format"),
    fare:        z.number({ coerce: true }).positive("Fare must be a positive number"),
    seats:       z.number({ coerce: true }).int().min(1, "At least 1 seat").max(10, "Max 10 seats"),
    vehicleType: z.string().optional(),
    amenities:   z.array(z.string()).optional()
});

export const searchRideSchema = z.object({
    pickup:      z.string().optional(),
    destination: z.string().optional(),
    date:        z.string().optional()
});

// ── Booking ──────────────────────────────────────────────────
export const requestBookingSchema = z.object({
    rideId:         z.number({ coerce: true, invalid_type_error: "rideId must be a number" }).int().positive(),
    seatsRequested: z.number({ coerce: true }).int().min(1, "At least 1 seat").max(10)
});

export const handleBookingSchema = z.object({
    action: z.enum(["accept", "reject"], { errorMap: () => ({ message: "Action must be 'accept' or 'reject'" }) })
});

// ── Chat ─────────────────────────────────────────────────────
export const sendMessageSchema = z.object({
    text: z.string().min(1, "Message cannot be empty").max(1000, "Message too long")
});
