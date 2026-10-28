import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../backend/src/app.js';
import { getDatabase, closeDatabase } from '../backend/src/database/index.js';
import { runMigrations } from '../backend/src/database/migrator.js';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

describe('End-to-End Holistic User & Admin Workflow', () => {
  let app;
  let testDbPath;
  let studentToken;
  let peerToken;
  let adminToken;
  let courseId;
  let lesson1Id;
  let lesson2Id;
  let enrollmentId;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const testId = crypto.randomBytes(4).toString('hex');
    testDbPath = path.resolve(process.cwd(), `backend/data/e2e_${testId}.sqlite`);
    process.env.DATABASE_PATH = testDbPath;

    const db = getDatabase(testDbPath);
    runMigrations(db);

    app = createApp();

    // 1. Create Admin
    const adminReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'E2E Admin',
        email: 'e2e.admin@learnsphere.io',
        password: 'AdminPassword123!',
      });
    // Promote to admin in DB
    db.prepare("UPDATE users SET role = 'admin' WHERE email = 'e2e.admin@learnsphere.io'").run();

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'e2e.admin@learnsphere.io', password: 'AdminPassword123!' });
    adminToken = adminLogin.body.data.token;
  });

  afterAll(() => {
    closeDatabase();
    if (testDbPath && fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
        if (fs.existsSync(`${testDbPath}-wal`)) fs.unlinkSync(`${testDbPath}-wal`);
        if (fs.existsSync(`${testDbPath}-shm`)) fs.unlinkSync(`${testDbPath}-shm`);
      } catch {}
    }
  });

  it('Step 1: Admin authors a course and 2 lessons', async () => {
    const courseRes = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'E2E Full Stack Course',
        description: 'Testing full user lifecycle',
        category: 'Web Dev',
        status: 'published',
      });
    expect(courseRes.status).toBe(201);
    courseId = courseRes.body.data.course.id;

    const l1 = await request(app)
      .post(`/api/v1/courses/${courseId}/lessons`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'E2E Lesson 1', content: '# Welcome to Lesson 1', position: 1, status: 'published' });
    expect(l1.status).toBe(201);
    lesson1Id = l1.body.data.lesson.id;

    const l2 = await request(app)
      .post(`/api/v1/courses/${courseId}/lessons`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'E2E Lesson 2', content: '# Welcome to Lesson 2', position: 2, status: 'published' });
    expect(l2.status).toBe(201);
    lesson2Id = l2.body.data.lesson.id;
  });

  it('Step 2: Student registers and logs in', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'E2E Student',
        email: 'e2e.student@learnsphere.io',
        password: 'StudentPassword123!',
      });
    expect(regRes.status).toBe(201);
    studentToken = regRes.body.data.token;

    // Register a second peer student
    const peerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'E2E Peer',
        email: 'e2e.peer@learnsphere.io',
        password: 'PeerPassword123!',
      });
    peerToken = peerRes.body.data.token;
  });

  it('Step 3: Student discovers and enrolls in the published course', async () => {
    const catalogRes = await request(app).get('/api/v1/courses');
    expect(catalogRes.status).toBe(200);
    const found = catalogRes.body.data.find((c) => c.id === courseId);
    expect(found).toBeDefined();

    const enrollRes = await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(enrollRes.status).toBe(201);
    enrollmentId = enrollRes.body.data.enrollment.id;

    // Verify duplicate enrollment rejection
    const dupRes = await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(dupRes.status).toBe(409);
  });

  it('Step 4: Student views lesson 1 content and marks it complete (progress: 50%)', async () => {
    const viewRes = await request(app)
      .get(`/api/v1/lessons/${lesson1Id}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(viewRes.status).toBe(200);
    expect(viewRes.body.data.navigation.nextLessonId).toBe(lesson2Id);

    const markRes = await request(app)
      .put(`/api/v1/enrollments/${enrollmentId}/lessons/${lesson1Id}/progress`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ isCompleted: true });

    expect(markRes.status).toBe(200);
    expect(markRes.body.data.progressPercentage).toBe(50);
    expect(markRes.body.data.enrollmentStatus).toBe('active');
  });

  it('Step 5: Security assertions - peer cannot tamper with progress', async () => {
    const peerTamperRes = await request(app)
      .put(`/api/v1/enrollments/${enrollmentId}/lessons/${lesson2Id}/progress`)
      .set('Authorization', `Bearer ${peerToken}`)
      .send({ isCompleted: true });

    expect(peerTamperRes.status).toBe(403);
  });

  it('Step 6: Student completes lesson 2 (progress: 100%, status: completed)', async () => {
    const markRes = await request(app)
      .put(`/api/v1/enrollments/${enrollmentId}/lessons/${lesson2Id}/progress`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ isCompleted: true });

    expect(markRes.status).toBe(200);
    expect(markRes.body.data.progressPercentage).toBe(100);
    expect(markRes.body.data.enrollmentStatus).toBe('completed');
  });

  it('Step 7: Admin verifies completion and exports report CSV', async () => {
    const completionsRes = await request(app)
      .get('/api/v1/admin/reports/completions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(completionsRes.status).toBe(200);
    expect(completionsRes.body.data.length).toBeGreaterThanOrEqual(1);

    const csvRes = await request(app)
      .get('/api/v1/admin/reports/completions/csv')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(csvRes.status).toBe(200);
    expect(csvRes.text).toContain('E2E Full Stack Course');
    expect(csvRes.text).toContain('e2e.student@learnsphere.io');
  });
});
