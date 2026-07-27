require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Start Express HTTP server immediately on 0.0.0.0 so Render's health check & port scanner pass instantly
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Connect to MongoDB Atlas in parallel
connectDB();
