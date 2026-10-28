import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export function errorHandler(err, req, res, _next) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = isAppError || config.env !== 'production' ? err.message : 'An unexpected internal error occurred';

  // Handle SQLite specific errors if uncaught
  if (err.name === 'SqliteError') {
    if (err.message.includes('FOREIGN KEY constraint failed')) {
      return res.status(400).json({
        type: 'https://learnsphere.io/errors/foreign-key-violation',
        title: 'Foreign Key Violation',
        status: 400,
        code: 'FOREIGN_KEY_VIOLATION',
        detail: 'The operation references a record that does not exist or has been deleted.',
        timestamp: new Date().toISOString(),
      });
    }
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        type: 'https://learnsphere.io/errors/unique-constraint-violation',
        title: 'Unique Constraint Violation',
        status: 409,
        code: 'DUPLICATE_RECORD',
        detail: 'A record with these unique attributes already exists.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  const response = {
    type: `https://learnsphere.io/errors/${code.toLowerCase().replace(/_/g, '-')}`,
    title: err.name || 'Error',
    status: statusCode,
    code,
    detail: message,
    timestamp: new Date().toISOString(),
  };

  if (err.details) {
    response.invalidParams = err.details;
  }

  if (statusCode >= 500) {
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled internal server error');
  } else {
    logger.warn({ code, statusCode, path: req.path, method: req.method, message }, 'Handled application error');
  }

  res.status(statusCode).json(response);
}
