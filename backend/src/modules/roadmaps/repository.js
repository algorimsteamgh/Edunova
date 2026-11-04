import { getDatabase } from '../../database/index.js';
import crypto from 'node:crypto';

export class RoadmapRepository {
  findAll({ category, level, search, technology } = {}) {
    const db = getDatabase();
    let query = `
      SELECT r.*,
        (SELECT COUNT(*) FROM roadmap_modules WHERE roadmap_id = r.id) as modules_count,
        (SELECT COUNT(*) FROM roadmap_topics WHERE roadmap_id = r.id) as topic_count
      FROM roadmaps r
      WHERE r.status = 'published'
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ' AND r.category = ?';
      params.push(category);
    }
    if (level && level !== 'all') {
      query += ' AND r.level = ?';
      params.push(level);
    }
    if (technology) {
      query += ' AND (r.tags LIKE ? OR r.skills_covered LIKE ?)';
      params.push(`%${technology}%`, `%${technology}%`);
    }
    if (search) {
      query += ' AND (r.title LIKE ? OR r.description LIKE ? OR r.skills_covered LIKE ? OR r.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY r.category ASC, r.title ASC';
    return db.prepare(query).all(...params);
  }

  findByIdOrSlug(idOrSlug) {
    const db = getDatabase();
    let rm = db.prepare(`
      SELECT r.*,
        (SELECT COUNT(*) FROM roadmap_modules WHERE roadmap_id = r.id) as modules_count,
        (SELECT COUNT(*) FROM roadmap_topics WHERE roadmap_id = r.id) as topic_count
      FROM roadmaps r
      WHERE r.id = ? OR r.slug = ?
    `).get(idOrSlug, idOrSlug);

    if (!rm) {
      // Secondary fallback: match with -developer, -engineer, rm- prefix, or prefix search
      rm = db.prepare(`
        SELECT r.*,
          (SELECT COUNT(*) FROM roadmap_modules WHERE roadmap_id = r.id) as modules_count,
          (SELECT COUNT(*) FROM roadmap_topics WHERE roadmap_id = r.id) as topic_count
        FROM roadmaps r
        WHERE r.slug = ? OR r.slug = ? OR r.id = ? OR r.slug LIKE ?
        LIMIT 1
      `).get(`${idOrSlug}-developer`, `${idOrSlug}-engineer`, `rm-${idOrSlug}`, `${idOrSlug}%`);
    }

    return rm;
  }

  findModules(roadmapId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT m.*,
        (SELECT COUNT(*) FROM roadmap_topics WHERE module_id = m.id) as topics_count
      FROM roadmap_modules m
      WHERE m.roadmap_id = ? AND m.status = 'published'
      ORDER BY m.display_order ASC
    `).all(roadmapId);
  }

  findTopics(roadmapId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT t.*,
        m.title as module_name,
        c.title as connected_course_title,
        l.title as connected_lesson_title
      FROM roadmap_topics t
      LEFT JOIN roadmap_modules m ON t.module_id = m.id
      LEFT JOIN courses c ON t.course_id = c.id
      LEFT JOIN lessons l ON t.lesson_id = l.id
      WHERE t.roadmap_id = ?
      ORDER BY t.display_order ASC
    `).all(roadmapId);
  }

  findTopicById(topicId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT t.*,
        r.title as roadmap_title,
        r.slug as roadmap_slug,
        r.category as roadmap_category,
        m.title as module_name,
        m.display_order as module_order
      FROM roadmap_topics t
      JOIN roadmaps r ON t.roadmap_id = r.id
      LEFT JOIN roadmap_modules m ON t.module_id = m.id
      WHERE t.id = ?
    `).get(topicId);
  }

  getTopicNeighbors(roadmapId, currentDisplayOrder) {
    const db = getDatabase();
    const prev = db.prepare(`
      SELECT id, title, display_order
      FROM roadmap_topics
      WHERE roadmap_id = ? AND display_order < ?
      ORDER BY display_order DESC
      LIMIT 1
    `).get(roadmapId, currentDisplayOrder);

    const next = db.prepare(`
      SELECT id, title, display_order
      FROM roadmap_topics
      WHERE roadmap_id = ? AND display_order > ?
      ORDER BY display_order ASC
      LIMIT 1
    `).get(roadmapId, currentDisplayOrder);

    return { prev: prev || null, next: next || null };
  }

  getUserEnrollment(studentId, roadmapId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM roadmap_enrollments
      WHERE user_id = ? AND roadmap_id = ?
    `).get(studentId, roadmapId);
  }

  enroll(studentId, roadmapId) {
    const db = getDatabase();
    const existing = this.getUserEnrollment(studentId, roadmapId);
    if (existing) return existing;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO roadmap_enrollments (id, user_id, student_id, roadmap_id, enrolled_at, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `).run(id, studentId, studentId, roadmapId, now);

    this.logLearningActivity(
      studentId,
      'roadmap_enrolled',
      'roadmap',
      roadmapId,
      `Enrolled in Roadmap`,
      { enrolled_at: now }
    );

    return { id, user_id: studentId, student_id: studentId, roadmap_id: roadmapId, enrolled_at: now, status: 'active' };
  }

  getUserTopicProgress(studentId, roadmapId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT utp.*, rt.display_order
      FROM user_topic_progress utp
      JOIN roadmap_topics rt ON utp.topic_id = rt.id
      WHERE utp.user_id = ? AND rt.roadmap_id = ?
    `).all(studentId, roadmapId);
  }

  getUserTopicProgressSingle(studentId, topicId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM user_topic_progress
      WHERE user_id = ? AND topic_id = ?
    `).get(studentId, topicId);
  }

  updateTopicProgress(studentId, topicId, status = 'completed') {
    const db = getDatabase();
    const existing = this.getUserTopicProgressSingle(studentId, topicId);
    const isCompleted = status === 'completed' ? 1 : 0;
    const now = new Date().toISOString();

    const topic = db.prepare('SELECT id, roadmap_id, title FROM roadmap_topics WHERE id = ?').get(topicId);
    const roadmapId = topic ? topic.roadmap_id : null;
    const topicTitle = topic ? topic.title : 'Topic Milestone';

    if (existing) {
      db.prepare(`
        UPDATE user_topic_progress
        SET is_completed = ?, status = ?, completed_at = ?, updated_at = ?
        WHERE user_id = ? AND topic_id = ?
      `).run(isCompleted, status, isCompleted ? now : null, now, studentId, topicId);
    } else {
      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO user_topic_progress (id, user_id, student_id, roadmap_id, topic_id, is_completed, status, completed_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, studentId, studentId, roadmapId, topicId, isCompleted, status, isCompleted ? now : null, now);
    }

    if (isCompleted) {
      this.logLearningActivity(
        studentId,
        'topic_completed',
        'topic',
        topicId,
        topicTitle,
        { roadmap_id: roadmapId, completed_at: now }
      );
    }
  }

  updateVideoProgress(studentId, topicId) {
    const db = getDatabase();
    const existing = this.getUserTopicProgressSingle(studentId, topicId);
    const now = new Date().toISOString();

    const topic = db.prepare('SELECT id, roadmap_id, title FROM roadmap_topics WHERE id = ?').get(topicId);
    const roadmapId = topic ? topic.roadmap_id : null;
    const topicTitle = topic ? topic.title : 'Video Lesson';

    if (existing) {
      db.prepare(`
        UPDATE user_topic_progress
        SET updated_at = ?
        WHERE user_id = ? AND topic_id = ?
      `).run(now, studentId, topicId);
    } else {
      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO user_topic_progress (id, user_id, student_id, roadmap_id, topic_id, is_completed, status, completed_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, 'in_progress', null, ?)
      `).run(id, studentId, studentId, roadmapId, topicId, now);
    }

    this.logLearningActivity(
      studentId,
      'video_watched',
      'video',
      topicId,
      topicTitle,
      { roadmap_id: roadmapId, watched_at: now }
    );
  }

  logLearningActivity(userId, activityType, entityType, entityId, title, metadata = {}) {
    const db = getDatabase();
    try {
      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO learning_activity (id, user_id, activity_type, entity_type, entity_id, title, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, activityType, entityType, entityId, title, JSON.stringify(metadata), new Date().toISOString());
    } catch (err) {
      // Non-blocking telemetry
      console.error('Failed to log learning activity:', err.message);
    }
  }

  getUserEnrolledRoadmaps(studentId) {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT r.*, re.enrolled_at, re.status as enrollment_status,
        (SELECT COUNT(*) FROM roadmap_modules WHERE roadmap_id = r.id) as modules_count,
        (SELECT COUNT(*) FROM roadmap_topics WHERE roadmap_id = r.id) as total_topics,
        (SELECT COUNT(*) FROM user_topic_progress utp
         JOIN roadmap_topics rt ON utp.topic_id = rt.id
         WHERE utp.user_id = ? AND rt.roadmap_id = r.id AND (utp.is_completed = 1 OR utp.status = 'completed')) as completed_topics
      FROM roadmap_enrollments re
      JOIN roadmaps r ON re.roadmap_id = r.id
      WHERE re.user_id = ? AND r.status = 'published'
      ORDER BY re.enrolled_at DESC
    `).all(studentId, studentId);

    return rows.map((r) => ({
      ...r,
      progressPercentage: r.total_topics > 0 ? Math.round((r.completed_topics / r.total_topics) * 100) : 0,
      skills_covered: typeof r.skills_covered === 'string' ? JSON.parse(r.skills_covered || '[]') : r.skills_covered,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : r.tags,
    }));
  }

  getStudentDashboardData(studentId) {
    const db = getDatabase();
    const enrolledRoadmaps = this.getUserEnrolledRoadmaps(studentId);

    // Completed topics list
    const completedTopics = db.prepare(`
      SELECT t.id, t.title, t.difficulty_level, t.estimated_duration, t.resource_type,
        r.id as roadmap_id, r.title as roadmap_title, r.slug as roadmap_slug,
        utp.completed_at
      FROM user_topic_progress utp
      JOIN roadmap_topics t ON utp.topic_id = t.id
      JOIN roadmaps r ON t.roadmap_id = r.id
      WHERE utp.user_id = ? AND (utp.is_completed = 1 OR utp.status = 'completed')
      ORDER BY utp.completed_at DESC
      LIMIT 20
    `).all(studentId);

    // In-Progress topics list
    const inProgressTopics = db.prepare(`
      SELECT t.id, t.title, t.difficulty_level, t.estimated_duration, t.resource_type,
        r.id as roadmap_id, r.title as roadmap_title, r.slug as roadmap_slug,
        utp.updated_at
      FROM user_topic_progress utp
      JOIN roadmap_topics t ON utp.topic_id = t.id
      JOIN roadmaps r ON t.roadmap_id = r.id
      WHERE utp.user_id = ? AND utp.status = 'in_progress' AND utp.is_completed = 0
      ORDER BY utp.updated_at DESC
      LIMIT 10
    `).all(studentId);

    // Continue Learning: Most recent in-progress topic or next available topic in first enrolled roadmap
    let continueLearning = inProgressTopics[0] || null;
    if (!continueLearning && enrolledRoadmaps.length > 0) {
      const firstRm = enrolledRoadmaps[0];
      const nextTopic = db.prepare(`
        SELECT t.id, t.title, t.difficulty_level, t.estimated_duration, t.resource_type,
          r.id as roadmap_id, r.title as roadmap_title, r.slug as roadmap_slug
        FROM roadmap_topics t
        JOIN roadmaps r ON t.roadmap_id = r.id
        WHERE t.roadmap_id = ? AND t.id NOT IN (
          SELECT topic_id FROM user_topic_progress
          WHERE user_id = ? AND is_completed = 1
        )
        ORDER BY t.display_order ASC
        LIMIT 1
      `).get(firstRm.id, studentId);
      continueLearning = nextTopic || null;
    }

    // Video Learning History
    const videoHistory = db.prepare(`
      SELECT la.*, t.video_title, t.channel_name, t.video_duration, t.video_id,
        r.slug as roadmap_slug, r.title as roadmap_title
      FROM learning_activity la
      LEFT JOIN roadmap_topics t ON la.entity_id = t.id
      LEFT JOIN roadmaps r ON t.roadmap_id = r.id
      WHERE la.user_id = ? AND la.activity_type = 'video_watched'
      ORDER BY la.created_at DESC
      LIMIT 10
    `).all(studentId);

    // Recently viewed topics
    const recentlyViewed = db.prepare(`
      SELECT la.*, t.difficulty_level, t.resource_type, r.slug as roadmap_slug, r.title as roadmap_title
      FROM learning_activity la
      LEFT JOIN roadmap_topics t ON la.entity_id = t.id
      LEFT JOIN roadmaps r ON t.roadmap_id = r.id
      WHERE la.user_id = ? AND la.activity_type = 'topic_viewed'
      ORDER BY la.created_at DESC
      LIMIT 10
    `).all(studentId);

    // Recent activity stream
    const recentActivity = db.prepare(`
      SELECT * FROM learning_activity
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 15
    `).all(studentId);

    // Recommended roadmaps (not yet enrolled)
    const enrolledIds = enrolledRoadmaps.map((r) => r.id);
    let recQuery = "SELECT * FROM roadmaps WHERE status = 'published'";
    if (enrolledIds.length > 0) {
      recQuery += ` AND id NOT IN (${enrolledIds.map(() => '?').join(',')})`;
    }
    recQuery += ' ORDER BY level ASC, title ASC LIMIT 6';
    const recommended = db.prepare(recQuery).all(...enrolledIds);

    const totalCompletedTopicsCount = completedTopics.length;
    const totalEnrolledRoadmapsCount = enrolledRoadmaps.length;

    return {
      enrolledRoadmaps,
      continueLearning,
      completedTopics,
      inProgressTopics,
      videoHistory,
      recentlyViewed,
      recentActivity,
      recommended: recommended.map((r) => ({
        ...r,
        skills_covered: typeof r.skills_covered === 'string' ? JSON.parse(r.skills_covered || '[]') : r.skills_covered,
        tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : r.tags,
      })),
      stats: {
        enrolledRoadmapsCount: totalEnrolledRoadmapsCount,
        completedTopicsCount: totalCompletedTopicsCount,
        inProgressTopicsCount: inProgressTopics.length,
        watchedVideosCount: videoHistory.length,
      },
    };
  }

  searchGlobal(query, { level, category } = {}) {
    const db = getDatabase();
    const searchParam = `%${query}%`;

    // 1. Matching Roadmaps
    let rmQuery = `
      SELECT r.id, r.slug, r.title, r.description, r.category, r.level, r.estimated_duration, 'roadmap' as match_type
      FROM roadmaps r
      WHERE r.status = 'published' AND (r.title LIKE ? OR r.description LIKE ? OR r.skills_covered LIKE ? OR r.tags LIKE ?)
    `;
    const rmParams = [searchParam, searchParam, searchParam, searchParam];
    if (category && category !== 'all') {
      rmQuery += ' AND r.category = ?';
      rmParams.push(category);
    }
    if (level && level !== 'all') {
      rmQuery += ' AND r.level = ?';
      rmParams.push(level);
    }
    rmQuery += ' LIMIT 10';
    const roadmaps = db.prepare(rmQuery).all(...rmParams);

    // 2. Matching Topics
    let topQuery = `
      SELECT t.id, t.title, t.description, t.difficulty_level, t.estimated_duration, t.resource_type,
        r.id as roadmap_id, r.title as roadmap_title, r.slug as roadmap_slug, 'topic' as match_type
      FROM roadmap_topics t
      JOIN roadmaps r ON t.roadmap_id = r.id
      WHERE t.status = 'published' AND (t.title LIKE ? OR t.description LIKE ? OR t.detailed_explanation LIKE ? OR t.subtopics_json LIKE ?)
    `;
    const topParams = [searchParam, searchParam, searchParam, searchParam];
    if (category && category !== 'all') {
      topQuery += ' AND r.category = ?';
      topParams.push(category);
    }
    topQuery += ' LIMIT 15';
    const topics = db.prepare(topQuery).all(...topParams);

    return {
      query,
      results: {
        roadmaps,
        topics,
        totalMatches: roadmaps.length + topics.length,
      },
    };
  }

  // --- ADMIN CONTENT MANAGEMENT OPERATIONS ---
  createRoadmap(data) {
    const db = getDatabase();
    const id = data.id || `rm-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO roadmaps (
        id, slug, title, description, category, subcategory, official_url,
        level, estimated_duration, thumbnail_url, tags, skills_covered,
        prerequisites_list, related_roadmap_ids, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.slug || id,
      data.title,
      data.description || '',
      data.category,
      data.subcategory || 'Software Engineering',
      data.official_url || `https://roadmap.sh/${data.slug || id}`,
      data.level || 'Beginner',
      data.estimated_duration || '30 hours',
      data.thumbnail_url || '/images/roadmaps/default.svg',
      JSON.stringify(data.tags || []),
      JSON.stringify(data.skills_covered || []),
      JSON.stringify(data.prerequisites_list || []),
      JSON.stringify(data.related_roadmap_ids || []),
      data.status || 'published',
      now,
      now
    );
    return this.findByIdOrSlug(id);
  }

  updateRoadmap(id, data) {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE roadmaps SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        level = COALESCE(?, level),
        estimated_duration = COALESCE(?, estimated_duration),
        skills_covered = COALESCE(?, skills_covered),
        tags = COALESCE(?, tags),
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?
    `).run(
      data.title,
      data.description,
      data.category,
      data.level,
      data.estimated_duration,
      data.skills_covered ? JSON.stringify(data.skills_covered) : null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.status,
      now,
      id
    );
    return this.findByIdOrSlug(id);
  }

  deleteRoadmap(id) {
    const db = getDatabase();
    db.prepare('DELETE FROM roadmaps WHERE id = ?').run(id);
    return { success: true, id };
  }

  createModule(roadmapId, data) {
    const db = getDatabase();
    const id = data.id || `mod-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const maxOrder = db.prepare('SELECT MAX(display_order) as m FROM roadmap_modules WHERE roadmap_id = ?').get(roadmapId)?.m || 0;
    db.prepare(`
      INSERT INTO roadmap_modules (id, roadmap_id, title, description, display_order, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, roadmapId, data.title, data.description || '', data.display_order || maxOrder + 1, data.status || 'published', now, now);
    return db.prepare('SELECT * FROM roadmap_modules WHERE id = ?').get(id);
  }

  updateModule(id, data) {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE roadmap_modules SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        display_order = COALESCE(?, display_order),
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?
    `).run(data.title, data.description, data.display_order, data.status, now, id);
    return db.prepare('SELECT * FROM roadmap_modules WHERE id = ?').get(id);
  }

  deleteModule(id) {
    const db = getDatabase();
    db.prepare('DELETE FROM roadmap_modules WHERE id = ?').run(id);
    return { success: true, id };
  }

  createTopic(roadmapId, data) {
    const db = getDatabase();
    const id = data.id || `top-${crypto.randomUUID().slice(0, 8)}`;
    const maxOrder = db.prepare('SELECT MAX(display_order) as m FROM roadmap_topics WHERE roadmap_id = ?').get(roadmapId)?.m || 0;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO roadmap_topics (
        id, roadmap_id, module_id, module_title, title, description, display_order,
        learning_objectives, prerequisites, difficulty_level, estimated_duration,
        detailed_explanation, subtopics_json, video_id, video_title, channel_name, video_duration,
        article_title, article_url, article_source, article_description, resource_type, resource_state, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      roadmapId,
      data.module_id || null,
      data.module_title || '',
      data.title,
      data.description || '',
      data.display_order || maxOrder + 1,
      JSON.stringify(data.learning_objectives || []),
      JSON.stringify(data.prerequisites || []),
      data.difficulty_level || 'Beginner',
      data.estimated_duration || '45 mins',
      data.detailed_explanation || '',
      JSON.stringify(data.subtopics || []),
      data.video_id || '',
      data.video_title || '',
      data.channel_name || '',
      data.video_duration || '',
      data.article_title || '',
      data.article_url || '',
      data.article_source || '',
      data.article_description || '',
      data.resource_type || (data.video_id ? 'video' : 'article'),
      data.video_id ? 'video_available' : (data.article_url ? 'alternative_available' : 'no_resource'),
      data.status || 'published',
      now,
      now
    );
    return this.findTopicById(id);
  }

  updateTopic(id, data) {
    const db = getDatabase();
    const now = new Date().toISOString();
    const resourceState = data.video_id
      ? 'video_available'
      : (data.article_url ? 'alternative_available' : 'no_resource');

    db.prepare(`
      UPDATE roadmap_topics SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        module_id = COALESCE(?, module_id),
        difficulty_level = COALESCE(?, difficulty_level),
        estimated_duration = COALESCE(?, estimated_duration),
        learning_objectives = COALESCE(?, learning_objectives),
        prerequisites = COALESCE(?, prerequisites),
        detailed_explanation = COALESCE(?, detailed_explanation),
        subtopics_json = COALESCE(?, subtopics_json),
        video_id = COALESCE(?, video_id),
        video_title = COALESCE(?, video_title),
        channel_name = COALESCE(?, channel_name),
        video_duration = COALESCE(?, video_duration),
        article_title = COALESCE(?, article_title),
        article_url = COALESCE(?, article_url),
        article_source = COALESCE(?, article_source),
        article_description = COALESCE(?, article_description),
        resource_type = COALESCE(?, resource_type),
        resource_state = ?,
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?
    `).run(
      data.title,
      data.description,
      data.module_id,
      data.difficulty_level,
      data.estimated_duration,
      data.learning_objectives ? JSON.stringify(data.learning_objectives) : null,
      data.prerequisites ? JSON.stringify(data.prerequisites) : null,
      data.detailed_explanation,
      data.subtopics ? JSON.stringify(data.subtopics) : null,
      data.video_id,
      data.video_title,
      data.channel_name,
      data.video_duration,
      data.article_title,
      data.article_url,
      data.article_source,
      data.article_description,
      data.resource_type,
      resourceState,
      data.status,
      now,
      id
    );
    return this.findTopicById(id);
  }

  deleteTopic(id) {
    const db = getDatabase();
    db.prepare('DELETE FROM roadmap_topics WHERE id = ?').run(id);
    return { success: true, id };
  }

  getTopicsMissingResources() {
    const db = getDatabase();
    const missingBoth = db.prepare(`
      SELECT t.id, t.title, t.roadmap_id, r.title as roadmap_title, r.slug as roadmap_slug,
        t.video_id, t.article_url, t.article_source, t.resource_type
      FROM roadmap_topics t
      JOIN roadmaps r ON t.roadmap_id = r.id
      WHERE (t.video_id IS NULL OR t.video_id = '') AND (t.article_url IS NULL OR t.article_url = '')
      ORDER BY r.title ASC, t.display_order ASC
    `).all();

    const missingVideos = db.prepare(`
      SELECT t.id, t.title, t.roadmap_id, r.title as roadmap_title, r.slug as roadmap_slug,
        t.video_id, t.article_url, t.article_source, t.resource_type
      FROM roadmap_topics t
      JOIN roadmaps r ON t.roadmap_id = r.id
      WHERE (t.video_id IS NULL OR t.video_id = '')
      ORDER BY r.title ASC, t.display_order ASC
    `).all();

    const missingArticles = db.prepare(`
      SELECT t.id, t.title, t.roadmap_id, r.title as roadmap_title, r.slug as roadmap_slug,
        t.video_id, t.article_url, t.article_source, t.resource_type
      FROM roadmap_topics t
      JOIN roadmaps r ON t.roadmap_id = r.id
      WHERE (t.article_url IS NULL OR t.article_url = '')
      ORDER BY r.title ASC, t.display_order ASC
    `).all();

    return {
      missingBoth,
      missingVideos,
      missingArticles,
      totalMissing: missingBoth.length,
    };
  }
}

export const roadmapRepository = new RoadmapRepository();
