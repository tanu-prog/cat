const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cron = require('cron');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const dealerRoutes = require('./routes/dealers');
const customerRoutes = require('./routes/customers');
const vehicleRoutes = require('./routes/vehicles');
const rentalRoutes = require('./routes/rentals');
const alertRoutes = require('./routes/alerts');
const searchRoutes = require('./routes/search');
const settingsRoutes = require('./routes/settings');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

// Import services
const { generateAlerts } = require('./services/alertService');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecotrack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dealers', dealerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Cron job for automatic alert generation
const alertJob = new cron.CronJob('0 */6 * * *', async () => {
  console.log('🔔 Running automatic alert generation...');
  try {
    await generateAlerts();
    console.log('✅ Alert generation completed');
  } catch (error) {
    console.error('❌ Alert generation failed:', error);
  }
});
alertJob.start();

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;