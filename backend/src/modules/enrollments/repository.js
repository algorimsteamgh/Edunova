import { getDatabase } from '../../database/index.js';

export class EnrollmentRepository {
  findByStudentAndCourse(studentId, courseId) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?').get(studentId, courseId);
  }

  findById(id) {
    const db = getDatabase();
    const query = `
      SELECT 
        e.id, 
        e.student_id, 
        e.course_id, 
        e.enrolled_at, 
        e.status,
        c.title AS course_title,
        c.description AS course_description,
        c.category AS course_category,
        c.thumbnail_url AS course_thumbnail_url,
        c.status AS course_status,
        u.full_name AS instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE e.id = ?
    `;
    return db.prepare(query).get(id);
  }

  findByStudent(studentId) {
    const db = getDatabase();
    const query = `
      SELECT 
        e.id, 
        e.student_id, 
        e.course_id, 
        e.enrolled_at, 
        e.status,
        c.title AS course_title,
        c.description AS course_description,
        c.category AS course_category,
        c.thumbnail_url AS course_thumbnail_url,
        c.status AS course_status,
        u.full_name AS instructor_name,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published') AS total_lessons,
        (SELECT COUNT(*) FROM lesson_progress lp 
           JOIN lessons l ON lp.lesson_id = l.id 
           WHERE lp.enrollment_id = e.id AND lp.is_completed = 1 AND l.status = 'published') AS completed_lessons
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `;
    return db.prepare(query).all(studentId);
  }

  createEnrollment({ id, studentId, courseId, enrolledAt, status = 'active' }) {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO enrollments (id, student_id, course_id, enrolled_at, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, studentId, courseId, enrolledAt, status);

    return this.findById(id);
  }

  updateStatus(id, status) {
    const db = getDatabase();
    db.prepare('UPDATE enrollments SET status = ? WHERE id = ?').run(status, id);
    return this.findById(id);
  }
}

export const enrollmentRepository = new EnrollmentRepository();
