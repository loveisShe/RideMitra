import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

dotenv.config();

import connectDB from "./database/dbConnection.js";
import userRoutes from "./routes/userAuthRoute.js";
import rideRouter from "./routes/rideRoute.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Middleware
app.use(cors({
    origin: [
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://localhost:5500", 
        "http://127.0.0.1:5500"
    ],
    credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Static
app.use(express.static(path.join(__dirname, "../Frontend")));
app.use(express.static("public"));

// ✅ Routes
app.use("/api/v4/user", userRoutes);
app.use("/api/rides", rideRouter);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ Frontend route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/login.html"));
});
app.get("/find-ride", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/find_ride.html"));
});

app.get("/post-ride", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/post_ride.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/Dashboard.html"));
});


// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    error: "Something went wrong!",
    message: err.message
  });
});

// ✅ START SERVER + SOCKET TOGETHER


const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:3000", 
          "http://127.0.0.1:3000", 
          "http://localhost:5500", 
          "http://127.0.0.1:5500"
        ],
        credentials: true
      }
    });

    global.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("join", (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    socket.join(userId.toString());

    console.log("Joined room:", userId);

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