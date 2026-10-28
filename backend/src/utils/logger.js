import pino from 'pino';
import { config } from '../config/index.js';

export const logger = pino({
  level: process.env.LOG_LEVEL || (config.env === 'production' ? 'info' : 'debug'),
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: ['req.headers.authorization', 'password', 'password_hash', 'token'],
  timestamp: pino.stdTimeFunctions.isoTime,
});
