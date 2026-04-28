import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

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
  origin: "*",   // allow frontend
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
app.use("/api/v4/rides", rideRouter);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ Frontend route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/login.html"));
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message
  });
});

// ✅ START SERVER + SOCKET TOGETHER
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});

// ✅ SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

export { io };

// ✅ SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    console.log("Joined room:", userId);
    socket.join(userId.toString());
  });
});