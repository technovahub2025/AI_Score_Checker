const { sendError } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const statusCode = err.statusCode || err.status || 500;

  if (isDev) {
    console.error(err.stack || err.message);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((item) => item.message)
      .join(' ');
    return sendError(res, message, 400);
  }

  if (err.name === 'CastError') {
    return sendError(res, `Invalid ${err.path} provided.`, 400);
  }

  if (err.code === 11000) {
    return sendError(res, 'Duplicate record found.', 400);
  }

  if (err.name === 'MulterError') {
    return sendError(res, err.message, 400);
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isDev ? { stack: err.stack } : {})
  });
};

module.exports = errorHandler;
