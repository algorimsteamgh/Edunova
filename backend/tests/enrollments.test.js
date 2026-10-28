import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';

describe('Scenarios 3 & 4: Enrollment Processing & Duplicate Prevention', () => {
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

  it('Scenario 3: allows a student to enroll in a published course (HTTP 201)', async () => {
    const res = await request(app)
      .post('/api/v1/courses/course-a/enroll')
      .set('Authorization', `Bearer ${tokens.student}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.enrollment.course_id).toBe('course-a');
    expect(res.body.data.enrollment.status).toBe('active');
  });

  it('Scenario 4: repeated enrollment does not create duplicates (HTTP 409 Conflict)', async () => {
    // Attempting to enroll student again in course-a
    const res = await request(app)
      .post('/api/v1/courses/course-a/enroll')
      .set('Authorization', `Bearer ${tokens.student}`);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('ALREADY_ENROLLED');
  });

  it('prevents enrollment in an unpublished draft course (HTTP 400)', async () => {
    const res = await request(app)
      .post('/api/v1/courses/course-draft/enroll')
      .set('Authorization', `Bearer ${tokens.student}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('COURSE_NOT_PUBLISHED');
  });

  it('lists enrolled courses for the current student in /me/enrollments', async () => {
    const res = await request(app)
      .get('/api/v1/me/enrollments')
      .set('Authorization', `Bearer ${tokens.student}`);

    expect(res.status).toBe(200);
    expect(res.body.data.enrollments).toHaveLength(1);
    expect(res.body.data.enrollments[0].course_id).toBe('course-a');
    expect(res.body.data.enrollments[0].progressPercentage).toBe(0);
    expect(res.body.data.enrollments[0].totalLessons).toBe(2);
  });
});
