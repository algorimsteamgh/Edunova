import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

export const authRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: 'https://learnsphere.io/errors/rate-limit-exceeded',
    title: 'Too Many Requests',
    status: 429,
    code: 'RATE_LIMIT_EXCEEDED',
    detail: 'Too many authentication attempts from this IP. Please try again later.',
    timestamp: new Date().toISOString(),
  },
  skip: () => config.env === 'test', // Skip rate limiting during test executions
});
