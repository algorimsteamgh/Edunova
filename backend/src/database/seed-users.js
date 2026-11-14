import { getDatabase } from './index.js';
import { runMigrations } from './migrator.js';
import { applySeedUsers, rollbackSeedUsers, buildCandidates, DEFAULT_TARGET } from './seedUsers.js';

// Usage: npm run seed:users            add the accounts (safe to run again)
//        npm run seed:users -- rollback remove exactly those accounts
//        npm run seed:users -- ids      print the candidate ids and emails (CSV), touches nothing
async function main() {
  const mode = process.argv[2] || 'apply';
  if (mode === 'ids') {
    console.log('id,email');
    for (const p of buildCandidates()) console.log(`${p.id},${p.email}`);
    return;
  }
  const db = getDatabase();
  runMigrations(db);
  if (mode === 'rollback') rollbackSeedUsers(db);
  else await applySeedUsers(db, { target: Number(process.env.SEED_USERS_TARGET) || DEFAULT_TARGET });
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('[Seed Users] Failed:', err.message);
  process.exit(1);
});
