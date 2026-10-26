import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    return sendError(res, 'Validation Error', 400, errors);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, `Duplicate field value entered: ${field}. Value must be unique.`, 409);
  }

  // CastError (e.g. invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Resource not found with invalid ID: ${err.value}`, 404);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'Uploaded file exceeds the maximum allowed size limit.', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, statusCode);
}
