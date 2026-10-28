import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';
import { extractYouTubeVideoId, isValidYouTubeVideoId, normalizeYouTubeUrl, getYouTubeEmbedUrl } from '../src/utils/youtube.js';
import { runMigrations } from '../src/database/migrator.js';

describe('YouTube Video Lessons & Course Player Integration', () => {
  let app;
  let db;
  let tokens;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;
    db = env.db;
    tokens = env.tokens;
  });

  afterAll(() => {
    teardownTestEnvironment();
  });

  describe('1. YouTube URL Parsing and Validation Utility', () => {
    it('extracts valid 11-character video IDs from all standard YouTube URL formats', () => {
      const cases = [
        ['https://www.youtube.com/watch?v=bMknfKXIFA8', 'bMknfKXIFA8'],
        ['https://youtu.be/bMknfKXIFA8', 'bMknfKXIFA8'],
        ['https://www.youtube.com/shorts/bMknfKXIFA8', 'bMknfKXIFA8'],
        ['https://www.youtube.com/embed/bMknfKXIFA8', 'bMknfKXIFA8'],
        ['https://m.youtube.com/watch?v=bMknfKXIFA8&feature=shared', 'bMknfKXIFA8'],
        ['https://youtube-nocookie.com/embed/bMknfKXIFA8', 'bMknfKXIFA8'],
        ['bMknfKXIFA8', 'bMknfKXIFA8'],
      ];

      for (const [url, expectedId] of cases) {
        expect(extractYouTubeVideoId(url)).toBe(expectedId);
        expect(isValidYouTubeVideoId(expectedId)).toBe(true);
      }
    });

    it('rejects unsupported domains, invalid hostnames, and malformed IDs', () => {
      const invalidCases = [
        'https://vimeo.com/12345678901',
        'https://dailymotion.com/video/x7tgad0',
        'https://evil.com/watch?v=bMknfKXIFA8',
        'https://fake-youtube.com/watch?v=bMknfKXIFA8',
        'https://youtube.com/watch?v=too_short',
        'https://youtube.com/watch?v=toolongvideoidentifier12345',
        'not a url at all',
        '',
        null,
      ];

      for (const bad of invalidCases) {
        expect(extractYouTubeVideoId(bad)).toBeNull();
      }
    });

    it('generates canonical embed URLs using the official youtube-nocookie domain', () => {
      const embedUrl = getYouTubeEmbedUrl('bMknfKXIFA8');
      expect(embedUrl).toContain('https://www.youtube-nocookie.com/embed/bMknfKXIFA8');
      expect(embedUrl).toContain('rel=0');
      expect(embedUrl).toContain('enablejsapi=1');
    });
  });

  describe('2. Course Catalog & Lesson Metadata Endpoints', () => {
    it('returns published courses with lesson counts and estimated duration', async () => {
      const res = await request(app).get('/api/v1/courses').expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const course = res.body.data[0];
      expect(course).toHaveProperty('published_lessons_count');
      expect(course).toHaveProperty('total_lessons_count');
      expect(course).toHaveProperty('estimated_duration');
      expect(course).toHaveProperty('preview_video_id');
    });

    it('fetches course details with ordered lessons and video metadata', async () => {
      const res = await request(app).get('/api/v1/courses/course-a').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.course.id).toBe('course-a');
      expect(Array.isArray(res.body.data.lessons)).toBe(true);
      expect(res.body.data.lessons.length).toBe(2);

      // Verify lesson order and fields
      const [l1, l2] = res.body.data.lessons;
      expect(l1.position).toBe(1);
      expect(l2.position).toBe(2);
      expect(l1).toHaveProperty('video_id');
      expect(l1).toHaveProperty('duration');
      expect(l1).toHaveProperty('channel_name');
    });
  });

  describe('3. Admin Video Lesson Creation & Validation', () => {
    it('allows an admin to create a lesson with a verified YouTube URL', async () => {
      const payload = {
        title: 'New React Hooks Deep Dive',
        content: '# Deep dive into React Hooks',
        videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
        duration: '35:10',
        description: 'Comprehensive walkthrough of useState and useEffect.',
        channelName: 'Web Dev Simplified',
        isPreview: true,
        status: 'published',
      };

      const res = await request(app)
        .post('/api/v1/courses/course-a/lessons')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.lesson.video_id).toBe('O6P86uwfdR0');
      expect(res.body.data.lesson.duration).toBe('35:10');
      expect(res.body.data.lesson.channel_name).toBe('Web Dev Simplified');
      expect(res.body.data.lesson.is_preview).toBe(1);
      expect(res.body.data.lesson.embed_url).toContain('https://www.youtube-nocookie.com/embed/O6P86uwfdR0');
    });

    it('rejects lessons with invalid or unsupported video URLs', async () => {
      const badPayload = {
        title: 'Invalid Video Test',
        content: 'Content',
        videoUrl: 'https://vimeo.com/987654321',
      };

      const res = await request(app)
        .post('/api/v1/courses/course-a/lessons')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send(badPayload)
        .expect(400);

      expect(res.body.code).toBe('VALIDATION_FAILED');
      expect(res.body.status).toBe(400);
      expect(res.body.invalidParams.length).toBeGreaterThan(0);
      expect(res.body.invalidParams[0].field).toBe('videoUrl');
    });

    it('prevents students from creating or editing lessons', async () => {
      const payload = {
        title: 'Unauthorized Lesson',
        content: 'Hack attempt',
        videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
      };

      await request(app)
        .post('/api/v1/courses/course-a/lessons')
        .set('Authorization', `Bearer ${tokens.student}`)
        .send(payload)
        .expect(403);
    });
  });

  describe('4. Enrollment & Access Control to Video Lessons', () => {
    it('blocks unauthenticated access to protected non-preview lessons', async () => {
      await request(app)
        .get('/api/v1/lessons/lesson-a1')
        .expect(403);
    });

    it('blocks authenticated non-enrolled students from accessing protected lessons', async () => {
      // Student is not enrolled in course-b
      await request(app)
        .get('/api/v1/lessons/lesson-b1')
        .set('Authorization', `Bearer ${tokens.student}`)
        .expect(403);
    });

    it('allows students to access free preview lessons before enrollment', async () => {
      // Find the preview lesson we created in section 3
      const listRes = await request(app).get('/api/v1/courses/course-a');
      const previewLesson = listRes.body.data.lessons.find((l) => l.is_preview === true);
      expect(previewLesson).toBeDefined();

      const res = await request(app)
        .get(`/api/v1/lessons/${previewLesson.id}`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isPreview).toBe(true);
      expect(res.body.data.lesson.video_id).toBe('O6P86uwfdR0');
    });

    it('successfully enrolls a student in a course', async () => {
      const res = await request(app)
        .post('/api/v1/courses/course-b/enroll')
        .set('Authorization', `Bearer ${tokens.student}`)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.enrollment.status).toBe('active');
    });

    it('prevents duplicate enrollment for an already enrolled student', async () => {
      const res = await request(app)
        .post('/api/v1/courses/course-b/enroll')
        .set('Authorization', `Bearer ${tokens.student}`)
        .expect(409);

      expect(res.body.code).toBe('ALREADY_ENROLLED');
    });

    it('allows access to protected lesson video after successful enrollment', async () => {
      const res = await request(app)
        .get('/api/v1/lessons/lesson-b1')
        .set('Authorization', `Bearer ${tokens.student}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.lesson.id).toBe('lesson-b1');
    });
  });

  describe('5. Progress Tracking & Integrity', () => {
    it('marks a lesson as complete and updates course progress percentage', async () => {
      // Get student's enrollment in course-b
      const detailsRes = await request(app)
        .get('/api/v1/courses/course-b')
        .set('Authorization', `Bearer ${tokens.student}`)
        .expect(200);

      const enrollmentId = detailsRes.body.data.enrollment.id;

      // Mark lesson-b1 complete
      const progressRes = await request(app)
        .put(`/api/v1/enrollments/${enrollmentId}/lessons/lesson-b1/progress`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .send({ isCompleted: true })
        .expect(200);

      expect(progressRes.body.success).toBe(true);
      expect(progressRes.body.data.progressPercentage).toBe(100);

      // Verify course details reflects 100% completion
      const updatedDetails = await request(app)
        .get('/api/v1/courses/course-b')
        .set('Authorization', `Bearer ${tokens.student}`)
        .expect(200);

      expect(updatedDetails.body.data.progress.completedLessons).toBe(1);
      expect(updatedDetails.body.data.progress.percentage).toBe(100);
      expect(updatedDetails.body.data.lessons[0].is_completed).toBe(true);
    });

    it('prevents a peer student from modifying another student’s progress', async () => {
      const detailsRes = await request(app)
        .get('/api/v1/courses/course-b')
        .set('Authorization', `Bearer ${tokens.student}`);

      const studentEnrollmentId = detailsRes.body.data.enrollment.id;

      // Peer student attempts to forge update on student's enrollment
      await request(app)
        .put(`/api/v1/enrollments/${studentEnrollmentId}/lessons/lesson-b1/progress`)
        .set('Authorization', `Bearer ${tokens.peer}`)
        .send({ isCompleted: false })
        .expect(403);
    });
  });

  describe('6. Database Migration Idempotency & Data Preservation', () => {
    it('running migrations repeatedly preserves all records without error', () => {
      const newlyApplied = runMigrations(db);
      expect(newlyApplied).toEqual([]);

      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
      expect(userCount).toBeGreaterThan(0);
    });
  });
});
