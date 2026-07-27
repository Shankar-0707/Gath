# MERN Stack Two-Token Authentication System

[![Stack](https://img.shields.io/badge/Stack-MongoDB%20|%20Express%20|%20React%20|%20Node-blue)](#)
[![Security](https://img.shields.io/badge/Security-Dual--Token%20JWT%20(HttpOnly)-green)](#)

A production-grade, highly secure implementation of a **Two-Token Authentication System (Short-Lived Access Token + Long-Lived HttpOnly Refresh Token)** designed for high-scale enterprise applications.

---

## 🚀 Key Features

- **Dual-Token Architecture**:
  - **Access Token (15 min)**: Kept in **memory** (Zustand store), preventing XSS attacks.
  - **Refresh Token (7 days)**: Sent as a secure `HttpOnly`, `SameSite` cookie, immune to JavaScript theft.
- **Refresh Token Rotation & Revocation**: Every refresh cycle generates a new refresh token and revokes the previous token stored as a SHA-256 hash in MongoDB.
- **Silent Refresh Interceptor**: Axios interceptor automatically requests a new access token when a 401 response is returned, queuing failed requests during refresh.
- **Fully Protected Routes**: Client-side `ProtectedRoute` component guards sensitive routes (`/dashboard`).
- **Security Hardening**: Integrated Helmet HTTP security headers, CORS origin whitelisting, and Express rate limiting on auth routes.
- **Modern UI**: Built with React (Vite), Lucide Icons, and Vanilla CSS with glassmorphism dark mode aesthetic.

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # Auth controllers (register, login, refresh, logout, me)
│   │   ├── middleware/      # verifyToken, rateLimiter, errorHandler
│   │   ├── models/          # User & RefreshToken Mongoose models
│   │   ├── routes/          # Auth & Dashboard Express routes
│   │   ├── utils/           # Token generation & SHA-256 hashing
│   │   └── app.js           # Express app setup
│   ├── server.js            # Server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance with silent refresh interceptors
│   │   ├── components/      # Navbar, ProtectedRoute guard
│   │   ├── pages/           # LoginPage, RegisterPage, DashboardPage
│   │   ├── store/           # Zustand memory-stored Auth state
│   │   ├── App.jsx          # React Router setup & initial session check
│   │   ├── main.jsx
│   │   └── index.css        # Glassmorphism design system
│   ├── package.json
│   └── .env.example
│
├── DEPLOYMENT_SUMMARY.md    # Full Architecture & Deployment details
└── README.md
```

---

## 🛠️ Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster connection string

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGODB_URI and JWT secrets in .env
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 📑 Architecture & Deployment Summary
For detailed information on the token flow, security trade-offs, and deployment instructions for **Vercel** (Frontend), **Render** (Backend), and **MongoDB Atlas** (Database), please see [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md).
