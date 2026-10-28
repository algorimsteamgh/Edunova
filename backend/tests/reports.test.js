import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';

describe('Scenario 12: Admin Telemetry & Reporting Accuracy', () => {
  let app;
  let tokens;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;
    tokens = env.tokens;

    // Enroll student in course-a
    await request(app)
      .post('/api/v1/courses/course-a/enroll')
      .set('Authorization', `Bearer ${tokens.student}`);
  });

  afterAll(() => {
    teardownTestEnvironment();
  });

  it('Scenario 12: enrollment reports accurately match database records', async () => {
    const res = await request(app)
      .get('/api/v1/admin/reports/enrollments')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);

    const enrollmentReport = res.body.data.find((r) => r.student_email === 'student@learnsphere.io');
    expect(enrollmentReport).toBeDefined();
    expect(enrollmentReport.course_title).toBe('Course Alpha');
    expect(enrollmentReport.enrollment_status).toBe('active');
  });

  it('rejects reporting endpoints for non-admin users (HTTP 403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/reports/enrollments')
      .set('Authorization', `Bearer ${tokens.student}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('INSUFFICIENT_PERMISSIONS');
  });

  it('exports enrollment report as CSV without leaking sensitive credentials', async () => {
    const res = await request(app)
      .get('/api/v1/admin/reports/enrollments/csv')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    const csvText = res.text;

    // Must include required CSV headers
    expect(csvText).toContain('Enrollment ID');
    expect(csvText).toContain('Student Name');
    expect(csvText).toContain('Student Email');
    expect(csvText).toContain('Course Title');

    // Security Check: Must NEVER contain password or password_hash!
    expect(csvText).not.toContain('password_hash');
    expect(csvText).not.toContain('TestPass123!');
  });
});
