import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

const env = process.env.NODE_ENV || 'development';

// Local development and tests only: production must provide its own JWT_SECRET.
const DEV_JWT_SECRET = 'learnsphere-local-development-only-jwt-secret';

// Secrets that have been committed to this repository. Anyone can sign tokens with them.
export const PUBLIC_JWT_SECRETS = new Set([
  DEV_JWT_SECRET,
  'learnsphere-super-secure-jwt-signing-secret-key-2026',
  'learnsphere-production-docker-compose-secret-key-2026',
]);

export const MIN_JWT_SECRET_LENGTH = 32;

function parseFlag(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

export const config = {
  env,
  port: parseInt(process.env.PORT || '5001', 10),
  dbPath: process.env.DATABASE_PATH || path.resolve(backendRoot, 'data/learnsphere.sqlite'),
  dbBusyTimeout: parseInt(process.env.DATABASE_BUSY_TIMEOUT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || (env === 'production' ? null : DEV_JWT_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  // Demo users, enrollments and progress with published passwords. Off in production unless explicitly enabled.
  seedDemoData: parseFlag(process.env.SEED_DEMO_DATA, env !== 'production'),
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminName: process.env.ADMIN_NAME || 'Platform Administrator',
  // Cloud Run sets K_SERVICE; its container disk is wiped on every restart.
  onCloudRun: Boolean(process.env.K_SERVICE),
  litestreamBucket: process.env.LITESTREAM_BUCKET || '',
  allowEphemeralDb: parseFlag(process.env.ALLOW_EPHEMERAL_DB, false),
  backendRoot,
};

// Returns a list of fatal configuration problems; the server refuses to start when it is non-empty.
export function getConfigErrors(cfg = config) {
  const errors = [];
  if (cfg.env !== 'production') {
    return errors;
  }

  if (!cfg.jwtSecret) {
    errors.push('JWT_SECRET is required in production (e.g. `openssl rand -base64 48`).');
  } else if (cfg.jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    errors.push(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters in production.`);
  } else if (PUBLIC_JWT_SECRETS.has(cfg.jwtSecret)) {
    errors.push('JWT_SECRET is a value published in this repository; generate a new random secret.');
  }

  if (cfg.onCloudRun && !cfg.litestreamBucket && !cfg.allowEphemeralDb) {
    errors.push(
      'Running on Cloud Run without durable storage: set LITESTREAM_BUCKET (see scripts/deploy-gcp.sh) ' +
        'or ALLOW_EPHEMERAL_DB=true to accept losing all data on every restart.'
    );
  }

  return errors;
}
