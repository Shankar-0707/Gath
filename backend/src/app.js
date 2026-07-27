const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security HTTP Headers
app.use(helmet());

// CORS Configuration (Strict origin whitelist + Vercel dynamic origin support)
const allowedOrigins = [
  process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.replace(/\/$/, '') : null,
  'https://gath-five.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const sanitizedOrigin = origin.replace(/\/$/, '');

      // Check allowed list or any vercel.app deployment domain
      if (
        allowedOrigins.includes(sanitizedOrigin) ||
        sanitizedOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked] Request origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true, // Crucial for HttpOnly cross-site cookie delivery
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsers & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Centralised Error Handling
app.use(errorHandler);

module.exports = app;
