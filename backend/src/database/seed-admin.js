import { getDatabase } from './index.js';
import { runMigrations } from './migrator.js';
import { bootstrapAdmin } from './bootstrap.js';

// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='<strong password>' npm run seed:admin
// Creates the admin, or promotes an existing account and resets its password. There is no default password.
async function main() {
  const db = getDatabase();
  runMigrations(db);

  const result = await bootstrapAdmin(db, {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    fullName: process.env.ADMIN_NAME || 'Platform Administrator',
  });

  if (result.action === 'promoted') {
    console.log(`[Admin Bootstrap] Existing user '${result.email}' promoted to admin and password updated.`);
  } else {
    console.log(`[Admin Bootstrap] Created primary administrator '${result.email}' (ID: ${result.id}).`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('[Admin Bootstrap] Failed:', err.message);
  process.exit(1);
});
