import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';
import { config, getConfigErrors } from '../src/config/index.js';
import {
  bootstrapAdmin,
  deactivateDemoAccounts,
  ensureAdminAccount,
  getAdminPasswordError,
} from '../src/database/bootstrap.js';
import { seedDatabase } from '../src/database/seed.js';

const STRONG_SECRET = 'x'.repeat(48);
const OLD_DEFAULT_SECRET = 'learnsphere-super-secure-jwt-signing-secret-key-2026';

function startServer(env) {
  return spawnSync(process.execPath, ['src/server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { PATH: process.env.PATH, LOG_LEVEL: 'fatal', ...env },
    timeout: 15000,
    encoding: 'utf8',
  });
}

describe('Production configuration guards', () => {
  const prod = { env: 'production', jwtSecret: STRONG_SECRET, dbConfigured: true };

  it('accepts a strong, unpublished secret', () => {
    expect(getConfigErrors(prod)).toEqual([]);
  });

  it('rejects a missing, short or published JWT secret in production', () => {
    expect(getConfigErrors({ ...prod, jwtSecret: null })[0]).toMatch(/JWT_SECRET is required/);
    expect(getConfigErrors({ ...prod, jwtSecret: 'short' })[0]).toMatch(/at least 32/);
    expect(getConfigErrors({ ...prod, jwtSecret: OLD_DEFAULT_SECRET })[0]).toMatch(/published/);
  });

  it('refuses to start in production without a database configured', () => {
    expect(getConfigErrors({ ...prod, dbConfigured: false })[0]).toMatch(/No database configured/);
  });

  it('does not apply production rules outside production', () => {
    expect(getConfigErrors({ ...prod, env: 'development', jwtSecret: null })).toEqual([]);
  });

  it('server exits before listening when JWT_SECRET is missing in production', () => {
    const result = startServer({ NODE_ENV: 'production' });
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/JWT_SECRET is required/);
  });

  it('server exits in production without a database configured', () => {
    const result = startServer({ NODE_ENV: 'production', JWT_SECRET: STRONG_SECRET });
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/No database configured/);
  });
});

describe('Token forgery', () => {
  let app;
  let db;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;
    db = env.db;
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  it('rejects an admin token signed with the old published default secret', async () => {
    const forged = jwt.sign({ sub: 'user-admin', role: 'admin' }, OLD_DEFAULT_SECRET);
    const res = await request(app).get('/api/v1/admin/users').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('rejects an unsigned (alg: none) token', async () => {
    const part = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const unsigned = `${part({ alg: 'none', typ: 'JWT' })}.${part({ sub: 'user-admin', role: 'admin' })}.`;
    const res = await request(app).get('/api/v1/admin/users').set('Authorization', `Bearer ${unsigned}`);
    expect(res.status).toBe(401);
  });

  describe('Admin bootstrap and demo accounts', () => {
    it('refuses weak or published admin passwords', () => {
      expect(getAdminPasswordError('')).toMatch(/required/);
      expect(getAdminPasswordError('Short1A')).toMatch(/at least 12/);
      expect(getAdminPasswordError('AdminPass123!')).toMatch(/published/);
      expect(getAdminPasswordError('alllowercase123')).toMatch(/uppercase/);
      expect(getAdminPasswordError('Correct-Horse-42-Battery')).toBeNull();
    });

    it('creates an admin from the environment that can log in', async () => {
      const result = await bootstrapAdmin(db, { email: 'Owner@Example.com', password: 'Correct-Horse-42-Battery' });
      expect(result.action).toBe('created');

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'owner@example.com', password: 'Correct-Horse-42-Battery' });
      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('admin');
    });

    it('only bootstraps when no active admin exists', async () => {
      const result = await ensureAdminAccount(db, { adminEmail: 'second@example.com', adminPassword: 'Correct-Horse-42-Battery' });
      expect(result).toBeNull();
      expect(await await db.prepare("SELECT 1 FROM users WHERE email = 'second@example.com'").get()).toBeUndefined();
    });

    it('deactivates demo accounts that still use their published password', async () => {
      const now = new Date().toISOString();
      const demoHash = await bcrypt.hash('TeacherPass123!', 4);
      await db.prepare(`
        INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
        VALUES ('u-inst-01', 'Prof. Elena Rostova', 'elena.rostova@learnsphere.io', ?, 'admin', 1, ?, ?)
      `).run(demoHash, now, now);

      const disabled = await deactivateDemoAccounts(db);

      // The test admin shares the demo email but not the published password, so it stays active.
      expect(disabled).toEqual(['elena.rostova@learnsphere.io']);
      expect((await await db.prepare("SELECT is_active FROM users WHERE id = 'u-inst-01'").get()).is_active).toBe(0);
      expect((await await db.prepare("SELECT is_active FROM users WHERE id = 'user-admin'").get()).is_active).toBe(1);

      const login = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'elena.rostova@learnsphere.io', password: 'TeacherPass123!' });
      expect(login.status).toBe(401);
    });

    it('refuses to run the destructive demo seed when demo data is disabled', async () => {
      const previous = config.seedDemoData;
      config.seedDemoData = false;
      try {
        await expect(seedDatabase(db)).rejects.toThrow(/Demo seeding is disabled/);
        expect((await await db.prepare('SELECT COUNT(*) AS c FROM courses').get()).c).toBeGreaterThan(0);
      } finally {
        config.seedDemoData = previous;
      }
    });
  });
});
