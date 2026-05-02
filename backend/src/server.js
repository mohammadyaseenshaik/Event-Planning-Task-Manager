console.log('🎬 Starting Ethara.ai Backend...');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('./config/db');

// Load env vars
dotenv.config();
console.log('🔑 Environment variables loaded');

async function startServer() {
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await connectDB();

    // Import models to register associations
    console.log('🏗️ Registering models...');
    require('./models');

    // Sync database
    console.log('🔄 Syncing database...');
    await sequelize.sync();
    console.log('✅ Database synchronized');

    const app = express();

    // Middleware
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    app.use(cors({
      origin: allowedOrigins,
      credentials: true,
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/events', require('./routes/events'));
    app.use('/api/tasks', require('./routes/tasks'));
    app.use('/api/notifications', require('./routes/notifications'));

    // Health check
    app.get('/api/health', (req, res) => {
      res.status(200).json({ success: true, message: 'Event Manager API is running 🚀' });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('❌ Global Error:', err.message);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
    });

    const PORT = process.env.PORT || 10000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('💥 FATAL STARTUP ERROR:', error);
    process.exit(1);
  }
}

startServer();
