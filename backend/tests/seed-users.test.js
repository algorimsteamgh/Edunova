import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';
import { getDatabase } from '../src/database/index.js';
import { applySeedUsers, rollbackSeedUsers, buildCandidates } from '../src/database/seedUsers.js';

describe('seed users', () => {
  beforeAll(async () => { await setupTestEnvironment(); });
  afterAll(() => { teardownTestEnvironment(); });

  it('builds the same unique candidates every time, on undeliverable domains', () => {
    const a = buildCandidates();
    const b = buildCandidates();
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
    expect(new Set(a.map((p) => p.email)).size).toBe(a.length);
    expect(new Set(a.map((p) => p.fullName.toLowerCase())).size).toBe(a.length);
    expect(a.every((p) => /@example\.(com|in|org|net)$/.test(p.email))).toBe(true);
  });

  it('is idempotent, skips clashes with existing users, and rolls back only its own rows', async () => {
    const db = getDatabase();
    const before = db.prepare('SELECT COUNT(*) n FROM users').get().n;
    const first = buildCandidates()[0];
    db.prepare("INSERT INTO users VALUES ('real-x', ?, 'real@gmail.com', 'h', 'student', 1, 'now', 'now')").run(first.fullName);

    const log = () => {};
    expect((await applySeedUsers(db, { target: 5, log })).inserted).toBe(5);
    expect((await applySeedUsers(db, { target: 5, log })).inserted).toBe(0);
    expect(db.prepare('SELECT COUNT(*) n FROM users WHERE id = ?').get(first.id).n).toBe(0);
    expect(db.prepare('SELECT COUNT(*) n FROM users').get().n).toBe(before + 6);

    expect(rollbackSeedUsers(db, { log }).removed).toBe(5);
    expect(db.prepare('SELECT COUNT(*) n FROM users').get().n).toBe(before + 1);
  });
});
