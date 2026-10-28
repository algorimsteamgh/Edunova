import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';

describe('Scenarios 5, 6 & 7: Progress Tracking & Cross-Course Safety', () => {
  let app;
  let tokens;
  let studentEnrollmentId;
  let peerEnrollmentId;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;
    tokens = env.tokens;

    // Enroll student in course-a
    const enrollRes1 = await request(app)
      .post('/api/v1/courses/course-a/enroll')
      .set('Authorization', `Bearer ${tokens.student}`);
    studentEnrollmentId = enrollRes1.body.data.enrollment.id;

    // Enroll peer in course-a
    const enrollRes2 = await request(app)
      .post('/api/v1/courses/course-a/enroll')
      .set('Authorization', `Bearer ${tokens.peer}`);
    peerEnrollmentId = enrollRes2.body.data.enrollment.id;
  });

  afterAll(() => {
    teardownTestEnvironment();
  });

  it('Scenario 5: student cannot modify another student’s progress (HTTP 403 Forbidden)', async () => {
    // Student attempts to modify peer's enrollment progress
    const res = await request(app)
      .put(`/api/v1/enrollments/${peerEnrollmentId}/lessons/lesson-a1/progress`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ isCompleted: true });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('Scenario 6: a lesson cannot be completed through an unrelated enrollment (HTTP 400 Bad Request)', async () => {
    // Student enrolled in course-a attempts to mark progress for lesson-b1 (which belongs to course-b!)
    const res = await request(app)
      .put(`/api/v1/enrollments/${studentEnrollmentId}/lessons/lesson-b1/progress`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ isCompleted: true });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('CROSS_COURSE_PROGRESS_FORGERY');
  });

  it('Scenario 7: course progress is calculated correctly when lessons are completed', async () => {
    // 1. Mark lesson 1 of 2 as complete (should be 50%)
    const res1 = await request(app)
      .put(`/api/v1/enrollments/${studentEnrollmentId}/lessons/lesson-a1/progress`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ isCompleted: true });

    expect(res1.status).toBe(200);
    expect(res1.body.data.totalLessons).toBe(2);
    expect(res1.body.data.completedLessons).toBe(1);
    expect(res1.body.data.progressPercentage).toBe(50);
    expect(res1.body.data.enrollmentStatus).toBe('active');

    // 2. Mark lesson 2 of 2 as complete (should reach 100% and transition enrollment to 'completed')
    const res2 = await request(app)
      .put(`/api/v1/enrollments/${studentEnrollmentId}/lessons/lesson-a2/progress`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ isCompleted: true });

    expect(res2.status).toBe(200);
    expect(res2.body.data.completedLessons).toBe(2);
    expect(res2.body.data.progressPercentage).toBe(100);
    expect(res2.body.data.enrollmentStatus).toBe('completed');

    // 3. Mark lesson 2 as incomplete (should downgrade back to 50% and transition back to 'active')
    const res3 = await request(app)
      .put(`/api/v1/enrollments/${studentEnrollmentId}/lessons/lesson-a2/progress`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ isCompleted: false });

    expect(res3.status).toBe(200);
    expect(res3.body.data.completedLessons).toBe(1);
    expect(res3.body.data.progressPercentage).toBe(50);
    expect(res3.body.data.enrollmentStatus).toBe('active');
  });
});
