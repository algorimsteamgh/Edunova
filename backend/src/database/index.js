import fs from 'node:fs';
import { AsyncLocalStorage } from 'node:async_hooks';
import pg from 'pg';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// COUNT(*) and SUM() return int8, AVG() returns numeric; both arrive as strings by default.
// Every count in this app fits in a JS number, so parse them to keep the old SQLite behaviour.
pg.types.setTypeParser(pg.types.builtins.INT8, (v) => parseInt(v, 10));
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (v) => parseFloat(v));

// The code base writes SQLite-style `?` placeholders; PostgreSQL wants $1, $2, ...
// Question marks inside quoted strings, quoted identifiers and comments are left alone.
const placeholderCache = new Map();
export function toPgPlaceholders(sql) {
  const cached = placeholderCache.get(sql);
  if (cached) return cached;
  let out = '';
  let n = 0;
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'" || ch === '"') {
      const end = sql.indexOf(ch, i + 1);
      const stop = end === -1 ? sql.length : end + 1;
      out += sql.slice(i, stop);
      i = stop;
    } else if (ch === '-' && sql[i + 1] === '-') {
      const end = sql.indexOf('\n', i);
      const stop = end === -1 ? sql.length : end;
      out += sql.slice(i, stop);
      i = stop;
    } else if (ch === '?') {
      n += 1;
      out += `$${n}`;
      i += 1;
    } else {
      out += ch;
      i += 1;
    }
  }
  placeholderCache.set(sql, out);
  return out;
}

function normaliseParams(params) {
  return params.map((p) => (p === undefined ? null : p));
}

// While a transaction runs, getDatabase() hands out the transaction's connection, so repository
// code called from inside db.transaction(...) joins the transaction without passing it around.
const txStore = new AsyncLocalStorage();

class Statement {
  constructor(queryable, sql) {
    this.queryable = queryable;
    this.text = toPgPlaceholders(sql);
  }

  async get(...params) {
    const res = await this.queryable.query(this.text, normaliseParams(params));
    return res.rows[0];
  }

  async all(...params) {
    const res = await this.queryable.query(this.text, normaliseParams(params));
    return res.rows;
  }

  async run(...params) {
    const res = await this.queryable.query(this.text, normaliseParams(params));
    return { changes: res.rowCount };
  }
}

// A small async version of the better-sqlite3 API the code base was written against:
// db.prepare(sql).get/all/run(...params), db.exec(sql), db.transaction(async (tx) => ...).
class Database {
  constructor(queryable, pool = null) {
    this.queryable = queryable;
    this.pool = pool;
  }

  prepare(sql) {
    return new Statement(this.queryable, sql);
  }

  async exec(sql) {
    await this.queryable.query(sql);
  }

  async query(text, params = []) {
    return this.queryable.query(text, params);
  }

  // Runs fn on one dedicated connection inside BEGIN/COMMIT. fn receives a Database bound to
  // that connection: every statement that must be atomic has to go through it.
  async transaction(fn) {
    if (!this.pool) {
      // Already inside a transaction: run in the same one.
      return fn(this);
    }
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const txDb = new Database(client, null);
      const result = await txStore.run(txDb, () => fn(txDb));
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        logger.error({ err: rollbackErr }, 'Transaction rollback failed');
      }
      throw err;
    } finally {
      client.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

// PGSSLMODE: disable (default when unset) | require (encrypt, no certificate check) |
// verify-full (encrypt and check the server certificate against PGSSLROOTCERT).
export function sslConfig(env = process.env) {
  const mode = (env.PGSSLMODE || '').toLowerCase();
  if (!mode || mode === 'disable' || mode === 'allow' || mode === 'prefer') {
    return false;
  }
  if (mode === 'require' || mode === 'no-verify') {
    return { rejectUnauthorized: false };
  }
  const ssl = { rejectUnauthorized: true };
  if (env.PGSSLROOTCERT) {
    ssl.ca = fs.readFileSync(env.PGSSLROOTCERT, 'utf8');
  }
  return ssl;
}

let dbInstance = null;

/**
 * Returns the shared connection pool wrapper.
 * Connection settings come from DATABASE_URL, or else the standard PG* variables
 * (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE, PGSSLROOTCERT).
 * Tests pass { schema } to get a pool whose search_path is an isolated schema.
 */
export function getDatabase(options = null) {
  if (!options) {
    const tx = txStore.getStore();
    if (tx) return tx;
  }
  if (dbInstance && !options) {
    return dbInstance;
  }
  if (dbInstance && options) {
    const old = dbInstance;
    dbInstance = null;
    old.close().catch(() => {});
  }

  const poolConfig = {
    max: config.dbPoolMax,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: sslConfig(),
  };
  if (process.env.DATABASE_URL) {
    poolConfig.connectionString = process.env.DATABASE_URL;
  }
  if (options && options.schema) {
    poolConfig.options = `-c search_path=${options.schema}`;
  }

  const pool = new pg.Pool(poolConfig);
  pool.on('error', (err) => logger.error({ err }, 'Idle PostgreSQL client error'));
  dbInstance = new Database(pool, pool);

  logger.info(
    { host: process.env.PGHOST || '(DATABASE_URL)', database: process.env.PGDATABASE, schema: options?.schema },
    'PostgreSQL connection pool created'
  );
  return dbInstance;
}

export async function closeDatabase() {
  if (dbInstance) {
    const db = dbInstance;
    dbInstance = null;
    await db.close();
    logger.info('PostgreSQL connection pool closed');
  }
}

// Replaces SQLite's integrity_check / foreign_key_check. PostgreSQL enforces foreign keys and
// checks itself, so this looks for constraints that are not validated and orphaned rows.
const FK_CHECKS = [
  ['courses', 'instructor_id', 'users'],
  ['lessons', 'course_id', 'courses'],
  ['enrollments', 'student_id', 'users'],
  ['enrollments', 'course_id', 'courses'],
  ['lesson_progress', 'enrollment_id', 'enrollments'],
  ['lesson_progress', 'lesson_id', 'lessons'],
  ['audit_logs', 'actor_user_id', 'users'],
];

export async function runIntegrityCheck(db = null) {
  const conn = db || getDatabase();
  const notValidated = await conn
    .prepare(
      `SELECT conrelid::regclass::text AS table_name, conname
         FROM pg_constraint
        WHERE NOT convalidated AND connamespace = current_schema()::regnamespace`
    )
    .all();

  const fkViolations = [];
  for (const [table, column, parent] of FK_CHECKS) {
    const row = await conn
      .prepare(
        `SELECT COUNT(*) AS orphans FROM ${table} t
          WHERE t.${column} IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM ${parent} p WHERE p.id = t.${column})`
      )
      .get();
    if (row.orphans > 0) {
      fkViolations.push({ table, column, parent, orphans: row.orphans });
    }
  }

  const result = {
    integrityOk: notValidated.length === 0,
    fkOk: fkViolations.length === 0,
    integrityDetails: notValidated.length === 0 ? [{ integrity_check: 'ok' }] : notValidated,
    fkViolations,
  };

  logger.info(result, 'Database integrity check completed');
  return result;
}

export default getDatabase;
