<div align="center">

# 🚗 Ride मित्र

**A modern, real-time ride-sharing platform built for India.**

Share your daily commute, split the fuel cost, and travel smarter — together.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ridemitra.onrender.com-orange?style=for-the-badge&logo=render)](https://ridemitra-hymf.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge&logo=postgresql)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)

</div>

---

## ✨ What is RideMitra?

RideMitra is a full-stack ride-sharing web application where **drivers** can post their daily trips and **passengers** can discover, book, and chat with drivers — all in real time.

Think of it as a carpooling app built for college students and daily commuters across Indian cities.

---

## 🌟 Features

- 🔐 **Secure Authentication** — Email/password login with JWT, plus Google OAuth 2.0
- 🗺️ **Find & Post Rides** — Interactive Leaflet map to set pickup and drop-off points
- ⏱️ **Smart Duration Estimator** — Auto-calculates estimated travel time from your typed locations
- 💬 **Real-Time Chat** — Driver and passenger can message each other per booking via WebSockets
- 🔔 **Live Notifications** — Instant alerts when a booking is accepted, rejected, or updated
- 📸 **Profile Photos** — Upload and display profile pictures via Cloudinary
- 🛡️ **Rate Limiting & Helmet** — Brute-force protection and secure HTTP headers out of the box
- ✅ **Input Validation** — All API payloads validated with Zod before touching the database

---

## 🛠️ Tech Stack

**Backend**
- [Node.js](https://nodejs.org) + [Express 5](https://expressjs.com) — REST API server
- [Prisma ORM](https://prisma.io) — Database access layer
- [PostgreSQL](https://postgresql.org) — Primary relational database
- [Socket.io](https://socket.io) — Real-time bidirectional communication
- [JSON Web Tokens](https://jwt.io) — Stateless authentication
- [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs) — OAuth 2.0 ID token verification
- [Zod](https://zod.dev) — Runtime schema validation
- [Helmet](https://helmetjs.github.io) — HTTP security headers
- [Cloudinary](https://cloudinary.com) — Image storage & delivery
- [Bcryptjs](https://github.com/dcodeIO/bcrypt.js) — Password hashing

**Frontend**
- [EJS](https://ejs.co) — Server-side rendered templates
- [Leaflet.js](https://leafletjs.com) — Interactive maps
- [Nominatim (OpenStreetMap)](https://nominatim.org) — Free geocoding API

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- A Cloudinary account (for image uploads)
- A Google OAuth Client ID

### 1. Clone the repository
```bash
git clone https://github.com/loveisShe/RideMitra.git
cd RideMitra/Backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the `Backend/` folder:
```env
DATABASE_URL="postgresql://user:password@host:5432/ridemitra"
JWT_SECRET="your_jwt_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
NODE_ENV="development"
PORT=3000
```

### 4. Run database migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Start the server
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
Backend/
├── prisma/
│   └── schema.prisma        # Database schema (User, Ride, Booking, etc.)
├── src/
│   ├── controller/          # Request handlers (bridge between routes & services)
│   ├── middlewares/         # Auth, validation, rate limiting
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic & database operations
│   └── validators/          # Zod schemas for request validation
├── views/                   # EJS templates (frontend pages)
│   ├── find_ride.ejs
│   ├── post_ride.ejs
│   ├── Dashboard.ejs
│   ├── Notification.ejs
│   └── AccountSettings.ejs
└── server.js                # App entry point
```

---

## 🔑 API Overview

All protected routes require an `Authorization: Bearer <token>` header.

**Auth & Users** — `/api/v4/user/`
- `POST /register` — Create a new account
- `POST /login` — Login with email & password
- `POST /google-login` — Login with a Google ID token
- `GET /me` — Get current user profile
- `PATCH /update-profile` — Update profile details

**Rides** — `/api/v4/rides/`
- `POST /post-ride` — Driver posts a new ride
- `GET /all-rides` — Search available rides by pickup, destination, date
- `PATCH /update-seats/:id` — Driver updates available seat count

**Bookings** — `/api/v4/bookings/`
- `POST /request-booking` — Passenger requests a seat
- `PATCH /handle-booking/:id` — Driver accepts or rejects a booking
- `GET /my-bookings` — View all your bookings

**Chat** — `/api/v4/chat/`
- `POST /:bookingId` — Send a message (also emits via Socket.io)
- `GET /:bookingId` — Fetch message history for a booking

**Notifications** — `/api/v4/notifications/`
- `GET /` — Get all notifications for current user
- `PATCH /read/:id` — Mark a notification as read

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

---

<div align="center">
  Made with ❤️ for daily commuters across India
  <br/>
  <strong>Har Safar Ke Liye, Sahi मित्र</strong>
</div>
