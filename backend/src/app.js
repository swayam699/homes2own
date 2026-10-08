const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const developerRoutes = require('./routes/developerRoutes');
const locationRoutes = require('./routes/locationRoutes');
const amenityRoutes = require('./routes/amenityRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const siteVisitRoutes = require('./routes/siteVisitRoutes');
const callbackRoutes = require('./routes/callbackRoutes');
const leadRoutes = require('./routes/leadRoutes');
const followUpRoutes = require('./routes/followUpRoutes');
const projectStatusRoutes = require('./routes/projectStatusRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Security: Rate Limiting on authentication endpoints (disabled in test suite)
const authLimiter = process.env.NODE_ENV === 'test'
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 attempts per window
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
      },
    });

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'HOMES2OWN Real Estate Consultancy Platform API',
    market: 'Mumbai, Maharashtra, India',
  });
});

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/comparisons', comparisonRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/site-visits', siteVisitRoutes);
app.use('/api/callbacks', callbackRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/project-status', projectStatusRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// Static Serving of Frontend (Production Deployment)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
