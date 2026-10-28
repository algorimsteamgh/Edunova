import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';

describe('Scenario 2: Course Management & RBAC Protection', () => {
  let app;
  let tokens;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;
    tokens = env.tokens;
  });

  afterAll(() => {
    teardownTestEnvironment();
  });

  it('allows an administrator to create a new course (HTTP 201)', async () => {
    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        title: 'Advanced Operating Systems Architecture',
        description: 'Kernel internals and virtual memory architecture.',
        category: 'Systems',
        status: 'published',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.course.title).toBe('Advanced Operating Systems Architecture');
    expect(res.body.data.course.status).toBe('published');
  });

  it('rejects course creation when student attempts it (HTTP 403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({
        title: 'Unauthorized Student Course Attempt',
        category: 'Hacking',
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('INSUFFICIENT_PERMISSIONS');
  });

  it('rejects course creation when unauthenticated (HTTP 401 Unauthorized)', async () => {
    const res = await request(app).post('/api/v1/courses').send({
      title: 'No Token Course',
      category: 'General',
    });

    expect(res.status).toBe(401);
  });

  it('public course catalog returns only published courses for guest users', async () => {
    const res = await request(app).get('/api/v1/courses');
    expect(res.status).toBe(200);
    const courses = res.body.data;
    // None should be draft
    const hasDrafts = courses.some((c) => c.status === 'draft');
    expect(hasDrafts).toBe(false);
  });

  it('admin can query draft and archived courses', async () => {
    const res = await request(app)
      .get('/api/v1/courses?status=draft')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    const courses = res.body.data;
    expect(courses.length).toBeGreaterThan(0);
    expect(courses[0].status).toBe('draft');
  });
});
