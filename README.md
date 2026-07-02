# 🍽️ Restaurant Reservation Management System

A full-stack restaurant reservation management system built with React, Node.js (Express), MongoDB, and JWT authentication. Supports two roles — **Customer** and **Admin** — with real-time availability checking and double-booking prevention.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Business Logic & Assumptions](#business-logic--assumptions)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Seeded Test Accounts](#seeded-test-accounts)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 (Vite), React Router v7, Axios, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT (jsonwebtoken), bcryptjs for password hashing |
| Dev Tools | Nodemon, Vite dev server with API proxy |

---

## Features

### Customer
- Register and login
- Search for available tables by date, time slot, and guest count
- Book a table with one click
- View all personal reservations (with status)
- Cancel upcoming reservations

### Admin
- Login with admin credentials
- View all reservations across the system
- Filter reservations by specific date
- Cancel any reservation
- Dashboard with real-time statistics (total, confirmed, cancelled)

---

## Business Logic & Assumptions

### Double-Booking Prevention
The system prevents double-bookings at **two levels**:
1. **Availability Check (UI-level):** When a customer searches for tables, only tables that are free for the requested `(date, timeSlot)` AND have sufficient capacity are shown.
2. **Creation Validation (API-level):** When a reservation is submitted, the server re-checks that no confirmed reservation exists for the same `(table, date, timeSlot)` combination. This prevents race conditions where two users might select the same table simultaneously.

### Capacity Enforcement
- Each table has a fixed `capacity` (number of seats).
- A reservation request is only valid if `guests <= table.capacity`.
- Tables with insufficient capacity are never shown in availability results.

### Time Slot Model
- Reservations use **hourly time slots** from `09:00` to `21:00` (13 slots per day).
- Each table can hold **one reservation per time slot** (1-hour blocks).
- This simplification avoids complex overlapping time range calculations while still demonstrating the core booking logic.

### Status Model
- Reservations have two statuses: `Confirmed` and `Cancelled`.
- Cancelling a reservation frees the table for that slot (cancelled reservations are excluded from availability checks).
- There is no "pending" or "completed" status to keep the flow simple.

### Role Assignment
- All users registering via the public `/register` endpoint receive the `Customer` role.
- Admin users are created via the seed script or directly in the database.
- Role escalation is not available through the API (by design).

### Date Format
- Dates are stored as strings in `YYYY-MM-DD` format for simplicity and timezone-agnostic handling.
- The frontend restricts date selection to today or future dates.

---

## Project Structure

```
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, GetMe
│   │   └── reservationController.js # CRUD + availability logic
│   ├── middleware/
│   │   ├── auth.js                # protect (JWT) & authorize (role)
│   │   └── errorHandler.js        # Centralized error handling
│   ├── models/
│   │   ├── User.js               # User schema with password hashing
│   │   ├── Table.js              # Table schema
│   │   └── Reservation.js        # Reservation schema with compound index
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   └── reservationRoutes.js  # /api/reservations/*
│   ├── .env                      # Environment variables (not committed)
│   ├── .env.example              # Template for env vars
│   ├── package.json
│   ├── seed.js                   # Database seeding script
│   └── server.js                 # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── layout/
│   │   │       └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Unauthorized.jsx
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx
│   │   │   └── customer/
│   │   │       ├── CustomerDashboard.jsx
│   │   │       ├── CreateReservation.jsx
│   │   │       └── MyReservations.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios instance with JWT interceptor
│   │   ├── App.jsx               # Router configuration
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Tailwind CSS
│   ├── index.html
│   ├── vite.config.js            # Vite + Tailwind + API proxy
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally on port 27017 (or provide a remote URI)
- **npm** (comes with Node.js)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (or copy the example):

```bash
cp .env.example .env
```

Edit `.env` if needed (e.g., change `MONGO_URI` or `JWT_SECRET`).

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- 1 Admin user
- 1 Customer user
- 10 Tables with varying capacities (2–12 seats)

### 4. Start the Backend

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` with API requests proxied to the backend.

### 6. Access the Application

Open `http://localhost:3000` in your browser.

---

## Seeded Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@restaurant.com | admin123 |
| Customer | john@example.com | customer123 |

---

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new customer |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Private | Get current user profile |

### Reservations

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/reservations/availability` | Private | Check available tables (query: date, timeSlot, guests) |
| POST | `/api/reservations` | Private | Create a reservation (body: tableId, date, timeSlot, guests) |
| GET | `/api/reservations/my` | Private | Get logged-in user's reservations |
| PATCH | `/api/reservations/:id/cancel` | Private | Cancel a reservation (own or admin) |
| GET | `/api/reservations` | Admin | Get all reservations (query: date for filtering) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status check |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/restaurant_reservations` |
| `JWT_SECRET` | Secret key for JWT signing | (must be changed in production) |
| `JWT_EXPIRE` | Token expiration duration | `7d` |

---

## Design Decisions

1. **Hourly Time Slots** — Simplifies availability logic while demonstrating slot-based booking. Easy to extend to 30-min slots or custom durations.
2. **String Dates (YYYY-MM-DD)** — Avoids timezone issues inherent in JavaScript Date objects. All date comparisons are string-based.
3. **Compound Index on Reservation** — `(date, timeSlot, table)` index ensures fast availability queries even with large datasets.
4. **JWT in localStorage** — Simple approach for this project scope. For production, consider httpOnly cookies to mitigate XSS risks.
5. **Vite Proxy** — Frontend dev server proxies `/api` requests to the backend, avoiding CORS issues during development without complex configuration.
6. **No Pagination** — Given the scope of a restaurant (limited tables, reasonable booking volume), pagination is omitted for simplicity but can be added easily.

---

## Future Enhancements (Out of Scope)

- Email notifications on booking/cancellation
- Table management CRUD for admins
- Multi-restaurant support
- Waitlist functionality
- Calendar view for admins
- Rate limiting and request throttling
- Automated tests (Jest + Supertest for backend, React Testing Library for frontend)
