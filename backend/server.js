const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// --- Middleware ---
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL || '*'
    : '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Health Check Route ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// --- API Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

// --- Serve Frontend in Production ---
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// --- Centralized Error Handler (must be after routes) ---
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
