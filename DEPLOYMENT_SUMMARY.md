# Architecture & Deployment Summary

## 1. System Architecture Overview

This project implements a **production-ready, enterprise-grade two-token authentication system** built on the MERN stack (MongoDB Atlas, Express.js, React + Vite, Node.js).

### Token Strategy & Security Trade-offs

| Token Type | Lifespan | Storage Mechanism | Transport Method | Threat Mitigations |
|---|---|---|---|---|
| **Access Token** | 15 Minutes | In-Memory (Zustand State) | `Authorization: Bearer <token>` Header | **XSS Protection**: Immune to script reading (`document.cookie` / `localStorage` theft impossible). |
| **Refresh Token** | 7 Days | HttpOnly, Secure, SameSite Cookie | Automated via browser cookies (`withCredentials`) | **CSRF & XSS Protection**: Cannot be accessed by client JS. Rotated on every use & stored as SHA-256 hash in DB. |

```
                       ┌─────────────────────────┐
                       │   Client (React/Vite)   │
                       └────────────┬────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               │                                         │
   Access Token (15 min)                      Refresh Token (7 days)
   Stored in JS Memory                        Stored in HttpOnly Cookie
   Sent in Auth Header                        Sent automatically with credentials
               │                                         │
               └────────────────────┬────────────────────┘
                                    ▼
                       ┌─────────────────────────┐
                       │  Backend API (Express)  │
                       └────────────┬────────────┘
                                    │
                         SHA-256 Hashed Tokens
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │ Database (MongoDB Atlas)│
                       └─────────────────────────┘
```

### Key Security Features
1. **Token Rotation**: Every call to `/api/auth/refresh` invalidates the old refresh token and issues a new refresh token and access token pair.
2. **Database Token Revocation**: Refresh tokens are stored in MongoDB as SHA-256 hashes (`tokenHash`). Revoked tokens are flagged (`isRevoked: true`), disabling token re-use attacks.
3. **MongoDB TTL Index**: Expired refresh tokens are automatically purged by MongoDB without requiring background cron jobs.
4. **Helmet & Rate Limiting**: Protection against HTTP header vulnerabilities and brute-force login attempts (15 attempts / 15 mins).
5. **bcrypt Hashing**: Passwords stored using bcrypt with cost factor 12.

---

## 2. Deployment Guide

### A. Database Deployment — MongoDB Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read/write permissions.
3. Add `0.0.0.0/0` under Network Access to allow connections from Render.
4. Obtain the connection string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/mern_auth?retryWrites=true&w=majority`

### B. Backend Deployment — Render
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new **Web Service**.
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add the following **Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGODB_URI` = `<your_mongodb_atlas_uri>`
   - `ACCESS_TOKEN_SECRET` = `<generate_256_bit_random_secret>`
   - `REFRESH_TOKEN_SECRET` = `<generate_different_256_bit_random_secret>`
   - `ACCESS_TOKEN_EXPIRY` = `15m`
   - `REFRESH_TOKEN_EXPIRY` = `7d`
   - `CLIENT_ORIGIN` = `https://<your-vercel-app-name>.vercel.app`

### C. Frontend Deployment — Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Select **Root Directory**: `frontend`
3. Framework Preset: **Vite**
4. Add the following **Environment Variable**:
   - `VITE_API_BASE_URL` = `https://<your-render-backend-name>.onrender.com`
5. Deploy.

---

## 3. Local Development Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd <repo-folder>

# Backend setup
cd backend
npm install
# Configure .env file with your MONGODB_URI
npm run dev

# Frontend setup (in another terminal tab)
cd frontend
npm install
npm run dev
```

---

## 4. Verification Checklist

- [x] Dual-token generation on `/api/auth/register` and `/api/auth/login`
- [x] Access token stored purely in-memory in Zustand store
- [x] Refresh token attached as `HttpOnly`, `SameSite` cookie
- [x] Axios interceptor performs silent token refresh on 401 response
- [x] Protected routes (`/dashboard`) guarded by `ProtectedRoute` component
- [x] Manual & automated token rotation functionality tested
