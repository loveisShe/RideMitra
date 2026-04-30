import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

dotenv.config();

import connectDB from "./src/database/dbConnection.js";
import userRoutes from "./src/routes/userAuthRoute.js";
import rideRouter from "./src/routes/rideRoute.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5500", "http://127.0.0.1:5500"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

// ================= ROUTES =================
app.use("/api/v4/user", userRoutes);
app.use("/api/v4/rides", rideRouter);
app.use("/api/v4/bookings", bookingRoutes);
app.use("/api/v4/notifications", notificationRoutes);

// ================= FRONTEND PAGES =================
app.get("/", (req, res) => res.render("login"));
app.get("/find-ride", (req, res) => res.render("find_ride"));
app.get("/post-ride", (req, res) => res.render("post_ride"));
app.get("/dashboard", (req, res) => res.render("Dashboard"));
app.get("/notifications", (req, res) => res.render("Notification"));
app.get("/account-settings", (req, res) => res.render("AccountSettings"));

app.use((err, req, res, next) => {
  console.error(err.stack);
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
          console.log("Joined room:", decoded.id);
        } catch (err) {
          console.log("Invalid token in socket");
        }
      });
    });

  } catch (err) {
    console.error("DB Connection Failed:", err.message);
  }
};

startServer();