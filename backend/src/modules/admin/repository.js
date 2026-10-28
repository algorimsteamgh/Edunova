import { getDatabase, runIntegrityCheck } from '../../database/index.js';

export class AdminRepository {
  getSystemStats() {
    const db = getDatabase();

    const totalUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    const totalStudents = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'student'").get().count;
    const totalAdmins = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").get().count;
    const publishedCourses = db.prepare("SELECT COUNT(*) AS count FROM courses WHERE status = 'published'").get().count;
    const totalCourses = db.prepare('SELECT COUNT(*) AS count FROM courses').get().count;
    const totalEnrollments = db.prepare('SELECT COUNT(*) AS count FROM enrollments').get().count;
    const completedEnrollments = db.prepare("SELECT COUNT(*) AS count FROM enrollments WHERE status = 'completed'").get().count;

    const recentEnrollments = db
      .prepare(`
        SELECT 
          e.id, 
          e.enrolled_at, 
          e.status,
          u.full_name AS student_name,
          u.email AS student_email,
          c.title AS course_title
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enrolled_at DESC
        LIMIT 5
      `)
      .all();

    const courseCompletionBreakdown = db
      .prepare(`
        SELECT 
          c.id, 
          c.title,
          COUNT(e.id) AS total_enrolled,
          SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) AS total_completed
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        GROUP BY c.id
        ORDER BY total_enrolled DESC
        LIMIT 6
      `)
      .all();

    return {
      totalUsers,
      totalStudents,
      totalAdmins,
      publishedCourses,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      recentEnrollments,
      courseCompletionBreakdown,
    };
  }

  listUsers({ search, role, page = 1, limit = 20 }) {
    const db = getDatabase();
    const whereClauses = [];
    const params = [];

    if (role && role !== 'all') {
      whereClauses.push('role = ?');
      params.push(role);
    }

    if (search) {
      whereClauses.push('(full_name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const countRow = db.prepare(`SELECT COUNT(*) AS total FROM users ${whereSql}`).get(...params);
    const total = countRow ? countRow.total : 0;

    const users = db
      .prepare(`
        SELECT 
          id, 
          full_name, 
          email, 
          role, 
          is_active, 
          created_at, 
          updated_at,
          (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = users.id) AS enrollments_count
        FROM users
        ${whereSql}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `)
      .all(...params, limit, offset);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  getEnrollmentsReport({ courseId, studentId, startDate, endDate, page = 1, limit = 50 }) {
    const db = getDatabase();
    const whereClauses = [];
    const params = [];

    if (courseId) {
      whereClauses.push('e.course_id = ?');
      params.push(courseId);
    }
    if (studentId) {
      whereClauses.push('e.student_id = ?');
      params.push(studentId);
    }
    if (startDate) {
      whereClauses.push('e.enrolled_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereClauses.push('e.enrolled_at <= ?');
      params.push(endDate);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const countRow = db.prepare(`SELECT COUNT(*) AS total FROM enrollments e ${whereSql}`).get(...params);
    const total = countRow ? countRow.total : 0;

    const rows = db
      .prepare(`
        SELECT 
          e.id AS enrollment_id,
          e.enrolled_at,
          e.status AS enrollment_status,
          u.id AS student_id,
          u.full_name AS student_name,
          u.email AS student_email,
          c.id AS course_id,
          c.title AS course_title,
          c.category AS course_category,
          (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published') AS total_lessons,
          (SELECT COUNT(*) FROM lesson_progress lp 
             JOIN lessons l ON lp.lesson_id = l.id 
             WHERE lp.enrollment_id = e.id AND lp.is_completed = 1 AND l.status = 'published') AS completed_lessons
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        JOIN courses c ON e.course_id = c.id
        ${whereSql}
        ORDER BY e.enrolled_at DESC
        LIMIT ? OFFSET ?
      `)
      .all(...params, limit, offset);

    const report = rows.map((r) => {
      const totalLessons = r.total_lessons || 0;
      const completed = r.completed_lessons || 0;
      const progressPercentage = totalLessons > 0 ? Math.floor((completed / totalLessons) * 100) : 0;
      return {
        ...r,
        progressPercentage,
      };
    });

    return {
      report,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  getCompletionsReport({ courseId, page = 1, limit = 50 }) {
    const db = getDatabase();
    const whereClauses = ["e.status = 'completed'"];
    const params = [];

    if (courseId) {
      whereClauses.push('e.course_id = ?');
      params.push(courseId);
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
    const offset = (page - 1) * limit;

    const countRow = db.prepare(`SELECT COUNT(*) AS total FROM enrollments e ${whereSql}`).get(...params);
    const total = countRow ? countRow.total : 0;

    const rows = db
      .prepare(`
        SELECT 
          e.id AS enrollment_id,
          e.enrolled_at,
          u.full_name AS student_name,
          u.email AS student_email,
          c.title AS course_title,
          c.category AS course_category,
          (SELECT MAX(completed_at) FROM lesson_progress lp WHERE lp.enrollment_id = e.id) AS completed_at
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        JOIN courses c ON e.course_id = c.id
        ${whereSql}
        ORDER BY e.enrolled_at DESC
        LIMIT ? OFFSET ?
      `)
      .all(...params, limit, offset);

    return {
      report: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  getProgressDetailsReport({ enrollmentId }) {
    const db = getDatabase();
    return db
      .prepare(`
        SELECT 
          e.id AS enrollment_id,
          u.full_name AS student_name,
          u.email AS student_email,
          c.title AS course_title,
          l.id AS lesson_id,
          l.title AS lesson_title,
          l.position AS lesson_position,
          COALESCE(lp.is_completed, 0) AS is_completed,
          lp.completed_at
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        JOIN courses c ON e.course_id = c.id
        JOIN lessons l ON l.course_id = c.id AND l.status = 'published'
        LEFT JOIN lesson_progress lp ON lp.enrollment_id = e.id AND lp.lesson_id = l.id
        WHERE e.id = ?
        ORDER BY l.position ASC
      `)
      .all(enrollmentId);
  }

  getHealthSummary() {
    const db = getDatabase();
    const integrity = runIntegrityCheck(db);
    const migrations = db.prepare('SELECT version, applied_at FROM schema_migrations ORDER BY applied_at DESC').all();

    const counts = {
      users: db.prepare('SELECT COUNT(*) AS count FROM users').get().count,
      courses: db.prepare('SELECT COUNT(*) AS count FROM courses').get().count,
      lessons: db.prepare('SELECT COUNT(*) AS count FROM lessons').get().count,
      enrollments: db.prepare('SELECT COUNT(*) AS count FROM enrollments').get().count,
      lesson_progress: db.prepare('SELECT COUNT(*) AS count FROM lesson_progress').get().count,
      audit_logs: db.prepare('SELECT COUNT(*) AS count FROM audit_logs').get().count,
    };

    return {
      database: 'SQLite 3 (WAL mode)',
      integrity,
      tableCounts: counts,
      migrations,
    };
  }
}

export const adminRepository = new AdminRepository();
