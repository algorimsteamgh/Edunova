import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { registerSchema } from '../modules/auth/validator.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// Accounts created by seed.js. Their passwords are published in the README, so they must never be live in production.
export const DEMO_ACCOUNTS = [
  { email: 'admin@learnsphere.io', password: 'AdminPass123!' },
  { email: 'elena.rostova@learnsphere.io', password: 'TeacherPass123!' },
  { email: 'alex.mercer@learnsphere.io', password: 'StudentPass123!' },
  { email: 'maria.santos@learnsphere.io', password: 'StudentPass123!' },
  { email: 'david.kim@learnsphere.io', password: 'StudentPass123!' },
];

const PUBLISHED_PASSWORDS = new Set([...DEMO_ACCOUNTS.map((a) => a.password), 'MigratedPass123!']);
const MIN_ADMIN_PASSWORD_LENGTH = 12;

export function getAdminPasswordError(password) {
  if (!password) {
    return 'ADMIN_PASSWORD is required.';
  }
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return `ADMIN_PASSWORD must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`;
  }
  if (PUBLISHED_PASSWORDS.has(password)) {
    return 'ADMIN_PASSWORD is a password published in this repository; choose a new one.';
  }
  const result = registerSchema.shape.password.safeParse(password);
  if (!result.success) {
    return `ADMIN_PASSWORD: ${result.error.errors[0].message}.`;
  }
  return null;
}

// Creates the admin, or promotes and resets an existing account with that email.
export async function bootstrapAdmin(db, { email, password, fullName = 'Platform Administrator' }) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('ADMIN_EMAIL is required.');
  }
  const passwordError = getAdminPasswordError(password);
  if (passwordError) {
    throw new Error(passwordError);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(normalizedEmail);

  if (existing) {
    db.prepare("UPDATE users SET role = 'admin', password_hash = ?, is_active = 1, updated_at = ? WHERE id = ?")
      .run(passwordHash, now, existing.id);
    logAuditEvent(null, 'ADMIN_BOOTSTRAPPED', 'user', existing.id, { email: normalizedEmail, action: 'promoted' });
    return { action: 'promoted', id: existing.id, email: normalizedEmail };
  }

  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'admin', 1, ?, ?)
  `).run(id, fullName, normalizedEmail, passwordHash, now, now);
  logAuditEvent(null, 'ADMIN_BOOTSTRAPPED', 'user', id, { email: normalizedEmail, action: 'created' });
  return { action: 'created', id, email: normalizedEmail };
}

// Disables any seeded demo account that still uses its published password.
export async function deactivateDemoAccounts(db) {
  const disabled = [];
  for (const account of DEMO_ACCOUNTS) {
    const user = db
      .prepare('SELECT id, password_hash FROM users WHERE lower(email) = ? AND is_active = 1')
      .get(account.email);
    if (user && (await bcrypt.compare(account.password, user.password_hash))) {
      db.prepare('UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?').run(new Date().toISOString(), user.id);
      logAuditEvent(null, 'DEMO_ACCOUNT_DEACTIVATED', 'user', user.id, { email: account.email });
      disabled.push(account.email);
    }
  }
  if (disabled.length > 0) {
    logger.error(
      { accounts: disabled },
      'Deactivated demo accounts that still used published passwords; reset them with `npm run seed:admin` if needed'
    );
  }
  return disabled;
}

// Makes sure production has an admin without ever falling back to a known password.
export async function ensureAdminAccount(db, cfg = config) {
  const activeAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin' AND is_active = 1 LIMIT 1").get();
  if (activeAdmin) {
    return null;
  }
  if (!cfg.adminEmail || !cfg.adminPassword) {
    logger.warn('No active admin account exists; set ADMIN_EMAIL and ADMIN_PASSWORD to create one on startup');
    return null;
  }
  const result = await bootstrapAdmin(db, {
    email: cfg.adminEmail,
    password: cfg.adminPassword,
    fullName: cfg.adminName,
  });
  logger.info({ email: result.email, action: result.action }, 'Bootstrapped administrator account from environment');
  return result;
}
