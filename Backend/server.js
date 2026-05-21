import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import helmet from "helmet"; // Bug #21
import rateLimit from "express-rate-limit"; // Bug #16

dotenv.config();

import connectDB from "./src/database/dbConnection.js";
import prisma from "./src/Lib/prismaClient.js";
import userRoutes from "./src/routes/userAuthRoute.js";
import rideRouter from "./src/routes/rideRoute.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5500", "http://127.0.0.1:5500"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
// Bug #21 fix: apply helmet security headers
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ================= ROUTES =================
app.use("/api/v4/user",          userRoutes);
app.use("/api/v4/rides",         rideRouter);
app.use("/api/v4/bookings",      bookingRoutes);
app.use("/api/v4/notifications", notificationRoutes);
app.use("/api/v4/chat",          chatRoutes);

// ================= FRONTEND PAGES =================
app.get("/",               (req, res) => res.render("login"));
app.get("/find-ride",      (req, res) => res.render("find_ride"));
app.get("/post-ride",      (req, res) => res.render("post_ride"));
app.get("/dashboard",      (req, res) => res.render("Dashboard"));
app.get("/notifications",  (req, res) => res.render("Notification"));
app.get("/account-settings", (req, res) => res.render("AccountSettings"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "File is too large. Max size allowed is 5MB." });
  }
  res.status(500).send({ error: "Something went wrong!", message: err.message });
});

// ================= SERVER + SOCKET =================
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const io = new Server(server, {
      cors: { origin: allowedOrigins, credentials: true }
    });

    global.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("join", (token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.join(decoded.id.toString());
          socket.data.userId = decoded.id.toString();
          console.log("Joined user room:", decoded.id);
        } catch (err) {
          console.log("Invalid token in socket");
        }
      });

      socket.on("join-chat", async ({ bookingId, token }) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId  = parseInt(decoded.id);

          const booking = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } });
          if (!booking) return socket.emit("chat-error", "Booking not found");

          const ride = await prisma.ride.findUnique({ where: { id: booking.rideId } });
          if (!ride)    return socket.emit("chat-error", "Ride not found");

          if (booking.status !== "accepted" ||
              ride.status === "completed"   ||
              ride.status === "cancelled") {
            return socket.emit("chat-error", "Chat is not available for this booking");
          }

          const isPassenger = booking.passengerId === userId;
          const isDriver    = ride.driverId       === userId;
          if (!isPassenger && !isDriver) {
            return socket.emit("chat-error", "Not authorised");
          }

          socket.join(`chat:${bookingId}`);
          socket.data.chatBookingId = bookingId;
          console.log(`User ${userId} joined chat room chat:${bookingId}`);
        } catch (err) {
          socket.emit("chat-error", "Invalid token");
        }
      });

      socket.on("chat-message", async ({ bookingId, token, text }) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId  = parseInt(decoded.id);

          const booking = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } });
          if (!booking) return;

          const ride = await prisma.ride.findUnique({ where: { id: booking.rideId } });
          if (!ride)    return;

          if (booking.status !== "accepted" ||
              ride.status === "completed"   ||
              ride.status === "cancelled") {
            return socket.emit("chat-error", "Chat is closed — ride has ended");
          }

          const isPassenger = booking.passengerId === userId;
          const isDriver    = ride.driverId       === userId;
          if (!isPassenger && !isDriver) return;

          const trimmed = (text || "").trim().slice(0, 1000);
          if (!trimmed) return;

          const sender = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
          const msg    = await prisma.message.create({
            data: { bookingId: parseInt(bookingId), senderId: userId, text: trimmed }
          });

          io.to(`chat:${bookingId}`).emit("chat-message", {
            id:        msg.id,
            bookingId,
            senderId:  { id: userId, name: sender?.name || "User" },
            text:      trimmed,
            createdAt: msg.createdAt
          });
        } catch (err) {
          console.error("chat-message error:", err.message);
        }
      });
    });

  } catch (err) {
    console.error("DB Connection Failed:", err.message);
  }
};

startServer();