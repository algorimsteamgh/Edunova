import { getDatabase } from '../../database/index.js';

export class ProgressRepository {
  findLessonProgress(enrollmentId, lessonId) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM lesson_progress WHERE enrollment_id = ? AND lesson_id = ?').get(enrollmentId, lessonId);
  }

  upsertLessonProgress({ id, enrollmentId, lessonId, isCompleted, completedAt, updatedAt }) {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO lesson_progress (id, enrollment_id, lesson_id, is_completed, completed_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(enrollment_id, lesson_id) DO UPDATE SET
        is_completed = excluded.is_completed,
        completed_at = excluded.completed_at,
        updated_at = excluded.updated_at
    `).run(id, enrollmentId, lessonId, isCompleted ? 1 : 0, completedAt, updatedAt);

    return this.findLessonProgress(enrollmentId, lessonId);
  }

  countPublishedLessons(courseId) {
    const db = getDatabase();
    const row = db.prepare("SELECT COUNT(*) AS total FROM lessons WHERE course_id = ? AND status = 'published'").get(courseId);
    return row ? row.total : 0;
  }

  countCompletedLessons(enrollmentId, courseId) {
    const db = getDatabase();
    const query = `
      SELECT COUNT(*) AS completed 
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      WHERE lp.enrollment_id = ? 
        AND lp.is_completed = 1 
        AND l.course_id = ? 
        AND l.status = 'published'
    `;
    const row = db.prepare(query).get(enrollmentId, courseId);
    return row ? row.completed : 0;
  }

  getProgressSummary(enrollmentId) {
    const db = getDatabase();
    const query = `
      SELECT 
        e.id AS enrollment_id,
        e.course_id,
        e.student_id,
        e.status AS enrollment_status,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = e.course_id AND l.status = 'published') AS total_lessons,
        (SELECT COUNT(*) FROM lesson_progress lp 
           JOIN lessons l ON lp.lesson_id = l.id 
           WHERE lp.enrollment_id = e.id AND lp.is_completed = 1 AND l.status = 'published') AS completed_lessons
      FROM enrollments e
      WHERE e.id = ?
    `;
    return db.prepare(query).get(enrollmentId);
  }
}

export const progressRepository = new ProgressRepository();
