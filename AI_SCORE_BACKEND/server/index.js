require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const scanRoutes = require('./routes/scanRoutes');
const errorHandler = require('./middleware/errorHandler');
const { pruneScans } = require('./services/scanRetentionService');

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = new Set(
  [
    clientUrl,
    process.env.ALLOWED_ORIGINS,
    process.env.CLIENT_URLS
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim())
    .filter(Boolean)
);
const allowedLocalOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://localhost:4173'
]);

const corsOrigin = (origin, callback) => {
  if (!origin) {
    return callback(null, true);
  }

  if (allowedOrigins.has(origin)) {
    return callback(null, true);
  }

  if (allowedLocalOrigins.has(origin)) {
    return callback(null, true);
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1|::1)(:\d+)?$/i.test(origin)) {
    return callback(null, true);
  }

  if (/^https:\/\/([a-z0-9-]+\.)?vercel\.app$/i.test(origin) || /^https:\/\/([a-z0-9-]+\.)?vercel\.com$/i.test(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`CORS policy does not allow origin ${origin}`));
};

app.use(
  cors({
    origin: corsOrigin,
    credentials: true
  })
);
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api', scanRoutes);

app.use((req, res, next) => {
  const error = new Error('Route not found.');
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  const RETENTION_SWEEP_MS = 24 * 60 * 60 * 1000;
  const runRetentionSweep = async () => {
    try {
      await pruneScans();
    } catch (error) {
      console.error('Retention sweep failed:', error.message || error);
    }
  };

  void runRetentionSweep();
  setInterval(runRetentionSweep, RETENTION_SWEEP_MS);
});
