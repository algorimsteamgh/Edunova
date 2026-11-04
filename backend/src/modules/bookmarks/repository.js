import { getDatabase } from '../../database/index.js';
import crypto from 'node:crypto';

export class BookmarkRepository {
  toggle(studentId, lessonId, notes = '') {
    const db = getDatabase();
    const existing = db.prepare(`
      SELECT * FROM student_bookmarks WHERE student_id = ? AND lesson_id = ?
    `).get(studentId, lessonId);

    if (existing) {
      db.prepare(`DELETE FROM student_bookmarks WHERE id = ?`).run(existing.id);
      return { bookmarked: false };
    } else {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO student_bookmarks (id, student_id, lesson_id, notes, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, studentId, lessonId, notes, now);
      return { bookmarked: true, id, lesson_id: lessonId, notes, created_at: now };
    }
  }

  isBookmarked(studentId, lessonId) {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT id FROM student_bookmarks WHERE student_id = ? AND lesson_id = ?
    `).get(studentId, lessonId);
    return Boolean(row);
  }

  findAllByStudent(studentId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT b.*,
        l.title as lesson_title,
        l.course_id,
        l.topic_title,
        l.subtopic_title,
        l.duration,
        c.title as course_title,
        c.category as course_category
      FROM student_bookmarks b
      JOIN lessons l ON b.lesson_id = l.id
      JOIN courses c ON l.course_id = c.id
      WHERE b.student_id = ?
      ORDER BY b.created_at DESC
    `).all(studentId);
  }
}

export const bookmarkRepository = new BookmarkRepository();

