const express = require('express');
require('express-async-errors');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const errorHandler = require('./api/middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/v1/auth', require('./api/routes/auth'));
app.use('/api/v1/events', require('./api/routes/events'));
app.use('/api/v1/exports', require('./api/routes/exports'));
app.use('/api/v1/permits', require('./api/routes/permits'));
app.use('/api/v1/operations', require('./api/routes/operations'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

module.exports = app;
