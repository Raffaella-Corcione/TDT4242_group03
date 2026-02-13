// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const declarationsRoutes = require('./routes/declarations');

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware Configuration
 */
// Enable CORS for frontend communication
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * API Routes
 */
app.use('/api/declarations', declarationsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AI Guidebook System API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * Initialize database and start server
 */
async function startServer() {
  try {
    // Initialize database and create tables
    await initializeDatabase();
    
    // Start listening for requests
    app.listen(PORT, () => {
      console.log('=================================');
      console.log('🚀 AI Guidebook System Server');
      console.log('=================================');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 API available at http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();