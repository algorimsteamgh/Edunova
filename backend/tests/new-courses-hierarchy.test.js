import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';
import { seedNewCourses, NEW_COURSES_DATA } from '../src/database/seedNewCourses.js';

describe('New Technical Domain Courses & Hierarchy Integration', () => {
  let app;
  let tokens;
  let db;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;
    tokens = env.tokens;
    db = env.db;

    // Seed the 12 modern domain courses
    seedNewCourses(db);
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  it('should have seeded all 12 unique new domain courses', () => {
    const courses = db.prepare("SELECT id, title, category, difficulty_level, estimated_duration FROM courses WHERE id LIKE 'c-%'").all();
    expect(courses.length).toBeGreaterThanOrEqual(12);

    const expectedCourseIds = NEW_COURSES_DATA.map((c) => c.id);

    for (const expectedId of expectedCourseIds) {
      const match = courses.find((c) => c.id === expectedId);
      expect(match).toBeDefined();
      expect(match.difficulty_level).toBeTruthy();
      expect(match.estimated_duration).toBeTruthy();
    }
  });

  it('should ensure each new course has at least 6 detailed topic/subtopic lessons with practical exercises', () => {
    for (const courseDef of NEW_COURSES_DATA) {
      expect(courseDef.lessons.length).toBeGreaterThanOrEqual(6);
      for (const lesson of courseDef.lessons) {
        expect(lesson.topicTitle).toBeTruthy();
        expect(lesson.subtopicTitle).toBeTruthy();
        expect(lesson.practicalExercise).toBeTruthy();
        expect(lesson.referenceUrls).toBeInstanceOf(Array);
        expect(lesson.referenceUrls.length).toBeGreaterThan(0);
        expect(lesson.videoId).toBeTruthy();
        expect(lesson.videoId).toMatch(/^[a-zA-Z0-9_-]{11}$/);
      }
    }
  });

  it('should return hierarchy fields when fetching course details via API', async () => {
    const res = await request(app)
      .get('/api/v1/courses/c-ai-01')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.course.title).toBe('Artificial Intelligence Fundamentals');
    expect(res.body.data.course.difficultyLevel).toBe('Beginner');
    expect(Array.isArray(res.body.data.course.learningObjectives)).toBe(true);
    expect(res.body.data.course.learningObjectives.length).toBeGreaterThan(0);

    // Lessons should include topicTitle and subtopicTitle
    const lessons = res.body.data.lessons;
    expect(lessons.length).toBeGreaterThanOrEqual(6);
    expect(lessons[0].topicTitle).toBe('Introduction to Artificial Intelligence');
    expect(lessons[0].subtopicTitle).toBeTruthy();
    expect(lessons[0].practicalExercise).toBeTruthy();
  });

  it('should allow student to enroll in a new domain course and complete lessons', async () => {
    // 1. Enroll student
    const enrollRes = await request(app)
      .post('/api/v1/courses/c-ai-01/enroll')
      .set('Authorization', `Bearer ${tokens.student}`)
      .expect(201);

    expect(enrollRes.body.success).toBe(true);
    const enrollmentId = enrollRes.body.data.enrollment.id;

    // 2. Access first lesson content
    const lessonRes = await request(app)
      .get('/api/v1/lessons/l-ai-01')
      .set('Authorization', `Bearer ${tokens.student}`)
      .expect(200);

    expect(lessonRes.body.success).toBe(true);
    const lessonData = lessonRes.body.data.lesson;
    expect(lessonData.videoId).toBe('ad79nYk2keg');
    expect(lessonData.practicalExercise).toContain('Exercise:');

    // 3. Mark lesson complete
    const progressRes = await request(app)
      .put(`/api/v1/enrollments/${enrollmentId}/lessons/l-ai-01/progress`)
      .set('Authorization', `Bearer ${tokens.student}`)
      .send({ isCompleted: true })
      .expect(200);

    expect(progressRes.body.success).toBe(true);
    expect(progressRes.body.data.progressPercentage).toBeGreaterThan(0);
  });
});
