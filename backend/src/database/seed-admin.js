import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { getDatabase } from './index.js';
import { runMigrations } from './migrator.js';

async function bootstrapAdmin() {
  const db = getDatabase();
  runMigrations(db);

  const email = process.env.ADMIN_EMAIL || 'admin@learnsphere.io';
  const rawPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
  const fullName = process.env.ADMIN_NAME || 'Platform Administrator';

  const existing = db.prepare('SELECT id, email, role FROM users WHERE email = ?').get(email);
  const now = new Date().toISOString();

  if (existing) {
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    db.prepare('UPDATE users SET role = ?, password_hash = ?, is_active = 1, updated_at = ? WHERE id = ?')
      .run('admin', passwordHash, now, existing.id);
    console.log(`[Admin Bootstrap] Existing user '${email}' promoted to admin and password updated.`);
  } else {
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const userId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `).run(userId, fullName, email, passwordHash, 'admin', now, now);
    console.log(`[Admin Bootstrap] Created primary administrator '${email}' (ID: ${userId}).`);
  }

  process.exit(0);
}

bootstrapAdmin().catch((err) => {
  console.error('[Admin Bootstrap] Failed:', err);
  process.exit(1);
});
