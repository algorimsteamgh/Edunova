import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDatabase, closeDatabase } from '../src/database/index.js';
import { runMigrations } from '../src/database/migrator.js';

// Each test file gets its own PostgreSQL schema, dropped again in teardown.
// Connection: DATABASE_URL or PG* variables (CI runs a postgres service container).
let testSchema = null;
let testApp = null;
let tokens = {};

export async function setupTestEnvironment() {
  process.env.NODE_ENV = 'test';
  testSchema = `test_${crypto.randomBytes(6).toString('hex')}`;

  const db = getDatabase({ schema: testSchema });
  await db.exec(`CREATE SCHEMA ${testSchema}`);
  await runMigrations(db);

  // Seed baseline test records
  const passwordHash = await bcrypt.hash('TestPass123!', 10);
  const now = new Date().toISOString();

  // Users
  await db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `).run('user-admin', 'Test Admin', 'admin@learnsphere.io', passwordHash, 'admin', now, now);

  await db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `).run('user-student', 'Test Student', 'student@learnsphere.io', passwordHash, 'student', now, now);

  await db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `).run('user-peer', 'Peer Student', 'peer@learnsphere.io', passwordHash, 'student', now, now);

  // Courses
  await db.prepare(`
    INSERT INTO courses (id, title, description, category, instructor_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('course-a', 'Course Alpha', 'Description A', 'Web Dev', 'user-admin', 'published', now, now);

  await db.prepare(`
    INSERT INTO courses (id, title, description, category, instructor_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('course-b', 'Course Beta', 'Description B', 'Databases', 'user-admin', 'published', now, now);

  await db.prepare(`
    INSERT INTO courses (id, title, description, category, instructor_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('course-draft', 'Course Draft', 'Description Draft', 'Cloud', 'user-admin', 'draft', now, now);

  // Lessons
  await db.prepare(`
    INSERT INTO lessons (id, course_id, title, content, position, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('lesson-a1', 'course-a', 'Lesson A1', 'Content A1', 1, 'published', now, now);

  await db.prepare(`
    INSERT INTO lessons (id, course_id, title, content, position, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('lesson-a2', 'course-a', 'Lesson A2', 'Content A2', 2, 'published', now, now);

  await db.prepare(`
    INSERT INTO lessons (id, course_id, title, content, position, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('lesson-b1', 'course-b', 'Lesson B1', 'Content B1', 1, 'published', now, now);

  testApp = createApp();

  // Obtain test tokens
  const adminRes = await request(testApp).post('/api/v1/auth/login').send({
    email: 'admin@learnsphere.io',
    password: 'TestPass123!',
  });
  tokens.admin = adminRes.body.data.token;

  const studentRes = await request(testApp).post('/api/v1/auth/login').send({
    email: 'student@learnsphere.io',
    password: 'TestPass123!',
  });
  tokens.student = studentRes.body.data.token;

  const peerRes = await request(testApp).post('/api/v1/auth/login').send({
    email: 'peer@learnsphere.io',
    password: 'TestPass123!',
  });
  tokens.peer = peerRes.body.data.token;

  return { app: testApp, db, tokens, testSchema };
}

export async function teardownTestEnvironment() {
  if (testSchema) {
    try {
      await getDatabase().exec(`DROP SCHEMA IF EXISTS ${testSchema} CASCADE`);
    } catch {
      // The schema name is random; a leftover one does no harm.
    }
    testSchema = null;
  }
  await closeDatabase();
}
