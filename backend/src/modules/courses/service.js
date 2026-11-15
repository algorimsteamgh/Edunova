
import crypto from 'node:crypto';
import { courseRepository } from './repository.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors.js';
import { logAuditEvent } from '../../utils/auditLogger.js';
import { getDatabase } from '../../database/index.js';
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from '../../utils/youtube.js';

export class CourseService {
  async listCourses(currentUser, query) {
    const isAdmin = currentUser && currentUser.role === 'admin';
    const effectiveStatus = isAdmin ? query.status : 'published';

    const result = await courseRepository.listCourses({
      ...query,
      status: effectiveStatus,
    });

    const coursesWithEmbed = result.courses.map((course) => ({
      ...course,
      difficultyLevel: course.difficulty_level || 'Beginner',
      learningObjectives: typeof course.learning_objectives === 'string' ? JSON.parse(course.learning_objectives || '[]') : (course.learning_objectives || []),
      preview_embed_url: course.preview_video_id ? getYouTubeEmbedUrl(course.preview_video_id) : '',
    }));

    return {
      ...result,
      courses: coursesWithEmbed,
    };
  }

  async getCourseDetails(currentUser, id) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = currentUser && currentUser.role === 'admin';
    if (!isAdmin && course.status !== 'published') {
      throw new NotFoundError('Course not found or is currently not published');
    }

    // Check if current user is enrolled
    let userEnrollment = null;
    let completedLessonIds = new Set();
    const db = getDatabase();

    if (currentUser) {
      userEnrollment = await db
        .prepare('SELECT id, status, enrolled_at FROM enrollments WHERE student_id = ? AND course_id = ?')
        .get(currentUser.id, id);

      if (userEnrollment) {
        const completedRows = await db
          .prepare('SELECT lesson_id FROM lesson_progress WHERE enrollment_id = ? AND is_completed = 1')
          .all(userEnrollment.id);
        completedLessonIds = new Set(completedRows.map((r) => r.lesson_id));
      }
    }

    // Fetch lessons for the course
    const lessonQuery = isAdmin
      ? 'SELECT id, title, position, status, video_id, video_url, duration, description, channel_name, is_preview, topic_title, subtopic_title, practical_exercise, reference_urls, created_at FROM lessons WHERE course_id = ? ORDER BY position ASC'
      : "SELECT id, title, position, status, video_id, video_url, duration, description, channel_name, is_preview, topic_title, subtopic_title, practical_exercise, reference_urls, created_at FROM lessons WHERE course_id = ? AND status = 'published' ORDER BY position ASC";

    const rawLessons = await db.prepare(lessonQuery).all(id);
    const lessons = rawLessons.map((l) => ({
      ...l,
      topic_title: l.topic_title || '',
      topicTitle: l.topic_title || '',
      subtopic_title: l.subtopic_title || '',
      subtopicTitle: l.subtopic_title || '',
      practical_exercise: l.practical_exercise || '',
      practicalExercise: l.practical_exercise || '',
      reference_urls: typeof l.reference_urls === 'string' ? JSON.parse(l.reference_urls || '[]') : (l.reference_urls || []),
      referenceUrls: typeof l.reference_urls === 'string' ? JSON.parse(l.reference_urls || '[]') : (l.reference_urls || []),
      embed_url: l.video_id ? getYouTubeEmbedUrl(l.video_id) : '',
      is_completed: completedLessonIds.has(l.id),
      is_preview: Boolean(l.is_preview),
    }));

    const previewEmbedUrl = course.preview_video_id ? getYouTubeEmbedUrl(course.preview_video_id) : '';

    return {
      course: {
        ...course,
        difficultyLevel: course.difficulty_level || 'Beginner',
        learningObjectives: typeof course.learning_objectives === 'string' ? JSON.parse(course.learning_objectives || '[]') : (course.learning_objectives || []),
        preview_embed_url: previewEmbedUrl,
      },
      lessons,
      enrollment: userEnrollment || null,
      progress: {
        completedLessons: completedLessonIds.size,
        totalLessons: lessons.length,
        percentage: lessons.length > 0 ? Math.round((completedLessonIds.size / lessons.length) * 100) : 0,
      },
    };
  }

  async createCourse(currentUser, data) {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new ForbiddenError('Only administrators can create courses');
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    let previewVideoId = data.previewVideoId || '';
    if (data.previewVideoUrl) {
      const extracted = extractYouTubeVideoId(data.previewVideoUrl);
      if (extracted) previewVideoId = extracted;
    } else if (previewVideoId) {
      const extracted = extractYouTubeVideoId(previewVideoId);
      if (extracted) previewVideoId = extracted;
    }

    const course = await courseRepository.createCourse({
      id,
      title: data.title,
      description: data.description || '',
      category: data.category,
      instructorId: currentUser.id,
      thumbnailUrl: data.thumbnailUrl || '/images/course-default.jpg',
      status: data.status || 'draft',
      estimatedDuration: data.estimatedDuration || '',
      previewVideoId,
      difficultyLevel: data.difficultyLevel || 'Beginner',
      learningObjectives: data.learningObjectives || [],
      createdAt: now,
      updatedAt: now,
    });

    await logAuditEvent(currentUser.id, 'COURSE_CREATED', 'course', id, { title: course.title, status: course.status });
    return {
      ...course,
      preview_embed_url: course.preview_video_id ? getYouTubeEmbedUrl(course.preview_video_id) : '',
    };
  }

  async updateCourse(currentUser, id, data) {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new ForbiddenError('Only administrators can update courses');
    }

    const existing = await courseRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Course not found');
    }

    const fieldsToUpdate = {};
    if (data.title !== undefined) fieldsToUpdate.title = data.title;
    if (data.description !== undefined) fieldsToUpdate.description = data.description;
    if (data.category !== undefined) fieldsToUpdate.category = data.category;
    if (data.thumbnailUrl !== undefined) fieldsToUpdate.thumbnail_url = data.thumbnailUrl;
    if (data.status !== undefined) fieldsToUpdate.status = data.status;
    if (data.estimatedDuration !== undefined) fieldsToUpdate.estimated_duration = data.estimatedDuration;
    if (data.difficultyLevel !== undefined) fieldsToUpdate.difficulty_level = data.difficultyLevel;
    if (data.learningObjectives !== undefined) fieldsToUpdate.learning_objectives = data.learningObjectives;

    if (data.previewVideoUrl !== undefined || data.previewVideoId !== undefined) {
      const input = data.previewVideoUrl || data.previewVideoId || '';
      if (input) {
        const extracted = extractYouTubeVideoId(input);
        fieldsToUpdate.preview_video_id = extracted || '';
      } else {
        fieldsToUpdate.preview_video_id = '';
      }
    }

    const updated = await courseRepository.updateCourse(id, fieldsToUpdate);
    await logAuditEvent(currentUser.id, 'COURSE_UPDATED', 'course', id, fieldsToUpdate);
    return {
      ...updated,
      preview_embed_url: updated.preview_video_id ? getYouTubeEmbedUrl(updated.preview_video_id) : '',
    };
  }

  async deleteOrArchiveCourse(currentUser, id) {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new ForbiddenError('Only administrators can delete or archive courses');
    }

    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const enrollmentCount = await courseRepository.countEnrollments(id);
    if (enrollmentCount > 0) {
      // Must not break historical student records: archive instead of hard delete
      const updated = await courseRepository.updateCourse(id, { status: 'archived' });
      await logAuditEvent(currentUser.id, 'COURSE_ARCHIVED', 'course', id, { reason: 'Active or past student enrollments exist' });
      return {
        action: 'archived',
        message: 'Course has historical student enrollments and was safely archived rather than deleted.',
        course: updated,
      };
    }

    await courseRepository.deleteCourse(id);
    await logAuditEvent(currentUser.id, 'COURSE_DELETED', 'course', id, { title: course.title });
    return {
      action: 'deleted',
      message: 'Course deleted permanently.',
    };
  }

  async getCategories() {
    return await courseRepository.listCategories();
  }
}

export const courseService = new CourseService();
