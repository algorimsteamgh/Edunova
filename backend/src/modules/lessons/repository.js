import { getDatabase } from '../../database/index.js';

export class LessonRepository {
  findByCourseId(courseId, includeDrafts = false) {
    const db = getDatabase();
    const query = includeDrafts
      ? 'SELECT * FROM lessons WHERE course_id = ? ORDER BY position ASC'
      : "SELECT * FROM lessons WHERE course_id = ? AND status = 'published' ORDER BY position ASC";
    return db.prepare(query).all(courseId);
  }

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
  }

  getMaxPosition(courseId) {
    const db = getDatabase();
    const row = db.prepare('SELECT MAX(position) AS maxPos FROM lessons WHERE course_id = ?').get(courseId);
    return row && row.maxPos ? row.maxPos : 0;
  }

  createLesson({
    id,
    courseId,
    title,
    content,
    position,
    status,
    videoId = '',
    videoUrl = '',
    duration = '',
    description = '',
    channelName = '',
    isPreview = 0,
    topicTitle = '',
    subtopicTitle = '',
    practicalExercise = '',
    referenceUrls = '[]',
    createdAt,
    updatedAt,
  }) {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO lessons (
        id, course_id, title, content, position, status,
        video_id, video_url, duration, description, channel_name, is_preview,
        topic_title, subtopic_title, practical_exercise, reference_urls,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      courseId,
      title,
      content,
      position,
      status,
      videoId,
      videoUrl,
      duration,
      description,
      channelName,
      isPreview ? 1 : 0,
      topicTitle,
      subtopicTitle,
      practicalExercise,
      typeof referenceUrls === 'string' ? referenceUrls : JSON.stringify(referenceUrls),
      createdAt,
      updatedAt
    );

    return this.findById(id);
  }

  updateLesson(id, fields) {
    const db = getDatabase();
    const setClauses = [];
    const params = [];

    const allowed = [
      'title',
      'content',
      'position',
      'status',
      'video_id',
      'video_url',
      'duration',
      'description',
      'channel_name',
      'is_preview',
      'topic_title',
      'subtopic_title',
      'practical_exercise',
      'reference_urls',
    ];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        if (key === 'is_preview') {
          params.push(fields[key] ? 1 : 0);
        } else if (key === 'reference_urls' && typeof fields[key] !== 'string') {
          params.push(JSON.stringify(fields[key]));
        } else {
          params.push(fields[key]);
        }
      }
    }

    setClauses.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    db.prepare(`UPDATE lessons SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  deleteLesson(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM lessons WHERE id = ?').run(id);
  }
}

export const lessonRepository = new LessonRepository();
