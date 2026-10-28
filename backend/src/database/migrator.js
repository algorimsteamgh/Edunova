import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatabase } from './index.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../../migrations');

export function runMigrations(customDb = null) {
  const db = customDb || getDatabase();

  // Ensure migrations tracking table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL,
      description TEXT
    );
  `);

  const appliedRows = db.prepare('SELECT version FROM schema_migrations ORDER BY version ASC').all();
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  if (!fs.existsSync(migrationsDir)) {
    logger.warn({ migrationsDir }, 'Migrations directory does not exist');
    return [];
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const newlyApplied = [];

  for (const file of migrationFiles) {
    const version = file.replace(/\.sql$/, '');
    if (appliedVersions.has(version)) {
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    logger.info({ version, file }, 'Executing pending database migration');

    const applyMigration = db.transaction(() => {
      db.exec(sql);
      const appliedAt = new Date().toISOString();
      const description = file.replace(/^[0-9]+_/, '').replace(/_/g, ' ').replace(/\.sql$/, '');
      db.prepare('INSERT INTO schema_migrations (version, applied_at, description) VALUES (?, ?, ?)')
        .run(version, appliedAt, description);
    });

    try {
      applyMigration();
      newlyApplied.push(version);
      logger.info({ version }, 'Successfully applied database migration');
    } catch (err) {
      logger.error({ version, error: err.message }, 'Failed to apply migration; transaction rolled back');
      throw err;
    }
  }

  if (newlyApplied.length === 0) {
    logger.info('Database schema is already up to date; 0 pending migrations');
  } else {
    logger.info({ count: newlyApplied.length, applied: newlyApplied }, 'Migration run completed successfully');
  }

  return newlyApplied;
}

// Allow CLI execution: `node src/database/migrator.js`
if (process.argv[1] && process.argv[1].endsWith('migrator.js')) {
  try {
    const applied = runMigrations();
    console.log(`[Migrator] Applied ${applied.length} migration(s). Database is ready.`);
    process.exit(0);
  } catch (err) {
    console.error('[Migrator] Migration execution error:', err);
    process.exit(1);
  }
}
