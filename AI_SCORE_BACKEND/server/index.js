require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const scanRoutes = require('./routes/scanRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL;

app.use(
  cors({
    origin: clientUrl || true,
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
app.use('/api/upload', uploadRoutes);

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
});
