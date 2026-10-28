import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let dbInstance = null;

export function getDatabase(customPath = null) {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  if (customPath && dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }

  const targetPath = customPath || config.dbPath;
  const isInMemory = targetPath === ':memory:';

  if (!isInMemory) {
    const dbDir = path.dirname(targetPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  const db = new Database(targetPath, {
    verbose: config.env === 'test' ? null : (sql) => logger.debug({ sql }, 'Executed SQL statement'),
  });

  // CRITICAL: Enforce SQLite relational pragmas on every connection
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.pragma(`busy_timeout = ${config.dbBusyTimeout}`);
  db.pragma('synchronous = NORMAL');

  dbInstance = db;

  logger.info({ path: targetPath, isInMemory }, 'SQLite database connection established with WAL and foreign keys');
  return db;
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    logger.info('SQLite database connection closed');
  }
}

export function runIntegrityCheck(db = null) {
  const conn = db || getDatabase();
  const integrity = conn.pragma('integrity_check');
  const fkCheck = conn.pragma('foreign_key_check');

  const isIntegrityOk = integrity.length === 1 && integrity[0].integrity_check === 'ok';
  const isFkOk = fkCheck.length === 0;

  const result = {
    integrityOk: isIntegrityOk,
    fkOk: isFkOk,
    integrityDetails: integrity,
    fkViolations: fkCheck,
  };

  logger.info(result, 'Database integrity check completed');
  return result;
}

export function createBackup(backupDestination = null) {
  const conn = getDatabase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const defaultDir = path.resolve(config.backendRoot, 'backups');
  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }

  const destPath = backupDestination || path.join(defaultDir, `backup_${timestamp}.sqlite`);
  
  logger.info({ destPath }, 'Initiating online SQLite database backup');
  conn.backup(destPath);
  logger.info({ destPath }, 'SQLite online backup completed successfully');
  return destPath;
}

export default getDatabase;
