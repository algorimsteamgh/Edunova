import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5001', 10),
  dbPath: process.env.DATABASE_PATH || path.resolve(backendRoot, 'data/learnsphere.sqlite'),
  dbBusyTimeout: parseInt(process.env.DATABASE_BUSY_TIMEOUT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'learnsphere-super-secure-jwt-signing-secret-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  backendRoot,
};
