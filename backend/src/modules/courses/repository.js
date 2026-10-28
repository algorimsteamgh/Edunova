import { getDatabase } from '../../database/index.js';

export class CourseRepository {
  listCourses({ search, category, status, sortBy = 'created_at', sortOrder = 'desc', page = 1, limit = 12 }) {
    const db = getDatabase();
    const whereClauses = [];
    const params = [];

    if (status && status !== 'all') {
      whereClauses.push('c.status = ?');
      params.push(status);
    }

    if (category) {
      whereClauses.push('c.category = ?');
      params.push(category);
    }

    if (search) {
      whereClauses.push('(c.title LIKE ? OR c.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) AS total FROM courses c ${whereSql}`;
    const totalRow = db.prepare(countQuery).get(...params);
    const total = totalRow ? totalRow.total : 0;

    const dataQuery = `
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.category, 
        c.instructor_id, 
        c.thumbnail_url, 
        c.status, 
        c.estimated_duration,
        c.preview_video_id,
        c.difficulty_level,
        c.learning_objectives,
        c.created_at, 
        c.updated_at,
        u.full_name AS instructor_name,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published') AS published_lessons_count,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS total_lessons_count,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollments_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      ${whereSql}
      ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    const courses = db.prepare(dataQuery).all(...params, limit, offset);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  findById(id) {
    const db = getDatabase();
    const query = `
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.category, 
        c.instructor_id, 
        c.thumbnail_url, 
        c.status, 
        c.estimated_duration,
        c.preview_video_id,
        c.difficulty_level,
        c.learning_objectives,
        c.created_at, 
        c.updated_at,
        u.full_name AS instructor_name,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published') AS published_lessons_count,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS total_lessons_count,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollments_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ?
    `;
    return db.prepare(query).get(id);
  }

  createCourse({
    id,
    title,
    description,
    category,
    instructorId,
    thumbnailUrl,
    status,
    estimatedDuration = '',
    previewVideoId = '',
    difficultyLevel = 'Beginner',
    learningObjectives = '[]',
    createdAt,
    updatedAt,
  }) {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO courses (
        id, title, description, category, instructor_id,
        thumbnail_url, status, estimated_duration, preview_video_id,
        difficulty_level, learning_objectives,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      description,
      category,
      instructorId,
      thumbnailUrl,
      status,
      estimatedDuration,
      previewVideoId,
      difficultyLevel,
      typeof learningObjectives === 'string' ? learningObjectives : JSON.stringify(learningObjectives),
      createdAt,
      updatedAt
    );

    return this.findById(id);
  }

  updateCourse(id, fields) {
    const db = getDatabase();
    const setClauses = [];
    const params = [];

    const allowed = [
      'title',
      'description',
      'category',
      'thumbnail_url',
      'status',
      'estimated_duration',
      'preview_video_id',
      'difficulty_level',
      'learning_objectives',
    ];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        if (key === 'learning_objectives' && typeof fields[key] !== 'string') {
          params.push(JSON.stringify(fields[key]));
        } else {
          params.push(fields[key]);
        }
      }
    }

    setClauses.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    db.prepare(`UPDATE courses SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  deleteCourse(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM courses WHERE id = ?').run(id);
  }

  countEnrollments(courseId) {
    const db = getDatabase();
    const row = db.prepare('SELECT COUNT(*) AS count FROM enrollments WHERE course_id = ?').get(courseId);
    return row ? row.count : 0;
  }

  listCategories() {
    const db = getDatabase();
    const rows = db.prepare('SELECT DISTINCT category FROM courses ORDER BY category ASC').all();
    return rows.map((r) => r.category);
  }
}

export const courseRepository = new CourseRepository();
