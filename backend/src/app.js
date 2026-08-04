const express = require('express');
require('express-async-errors');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { version } = require('../package.json');
const prisma = require('./db/prisma');
const errorHandler = require('./api/middleware/errorHandler');
const { authenticate, authorize } = require('./api/middleware/auth');
const { metricsReadLimiter } = require('./api/middleware/rateLimiters');
const { observabilityMiddleware, snapshotMetrics } = require('./api/middleware/observability');

const app = express();

// Security headers
app.use(helmet());
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'"],
    connectSrc: ["'self'", process.env.WAZE_CCP_URL || "https://example-waze-ccp.invalid"].filter(Boolean),
    frameSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : undefined
  },
  reportOnly: process.env.NODE_ENV !== 'production'
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(observabilityMiddleware);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buffer) => {
      if (req.originalUrl.startsWith('/api/v1/permits/hook')) {
        req.rawBody = Buffer.from(buffer);
      }
    }
  })
);

app.use('/api/v1/auth', require('./api/routes/auth'));
app.use('/api/v1/events', require('./api/routes/events'));
app.use('/api/v1/exports', require('./api/routes/exports'));
app.use('/api/v1/permits', require('./api/routes/permitFees'));
app.use('/api/v1/permits', require('./api/routes/permitIssuance'));
app.use('/api/v1/permits', require('./api/routes/permits'));
app.use('/api/v1/operations', require('./api/routes/operations'));
app.use('/api/v1/municipal/citizen-requests/escalations', require('./api/routes/citizenRequestEscalations'));
app.use('/api/v1/municipal/citizen-requests', require('./api/routes/municipalCitizenRequests'));
app.use('/api/v1/citizen/requests/:requestId/messages', require('./api/routes/citizenMessages'));
app.use('/api/v1/citizen/requests', require('./api/routes/citizenRequests'));
app.use('/api/v1/notifications', require('./api/routes/notifications'));
app.use('/api/v1/inspection-reminders', require('./api/routes/inspectionReminders'));
app.use('/api/v1/inspection-calendar', require('./api/routes/inspectionCalendar'));
app.use('/api/v1/inspection-dashboard', require('./api/routes/inspectionDashboard'));
app.use('/api/v1/inspection-trends', require('./api/routes/inspectionTrends'));
app.use('/api/v1/inspections/:inspectionId/evidence', require('./api/routes/inspectionEvidence'));
app.use('/api/v1/inspections', require('./api/routes/inspections'));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'cityflow-backend',
    version,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

app.get('/health/live', (req, res) => {
  res.json({
    status: 'ok',
    service: 'cityflow-backend',
    version,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

app.get('/health/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ready',
      service: 'cityflow-backend',
      version,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      service: 'cityflow-backend',
      version,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/metrics/http', metricsReadLimiter, authenticate, authorize('ADMIN'), (req, res) => {
  res.json({ generatedAt: new Date().toISOString(), metrics: snapshotMetrics() });
});

app.use(errorHandler);

module.exports = app;
