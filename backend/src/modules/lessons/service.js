import crypto from 'node:crypto';
import { lessonRepository } from './repository.js';
import { courseRepository } from '../courses/repository.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { logAuditEvent } from '../../utils/auditLogger.js';
import { getDatabase } from '../../database/index.js';
import { extractYouTubeVideoId, normalizeYouTubeUrl, getYouTubeEmbedUrl } from '../../utils/youtube.js';

export class LessonService {
  listLessons(currentUser, courseId) {
    const course = courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = currentUser && currentUser.role === 'admin';
    if (!isAdmin && course.status !== 'published') {
      throw new NotFoundError('Course not found');
    }

    const lessons = lessonRepository.findByCourseId(courseId, isAdmin);
    return lessons.map((l) => ({
      ...l,
      embed_url: l.video_id ? getYouTubeEmbedUrl(l.video_id) : '',
    }));
  }

  getLesson(currentUser, lessonId) {
    const lesson = lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }

    const course = courseRepository.findById(lesson.course_id);
    if (!course) {
      throw new NotFoundError('Associated course not found');
    }

    const isAdmin = currentUser && currentUser.role === 'admin';

    if (!isAdmin && lesson.status !== 'published') {
      throw new NotFoundError('Lesson is currently in draft');
    }

    const isPreview = Boolean(lesson.is_preview);

    // Access authorization: Student must be enrolled UNLESS it is configured as free preview
    let enrollment = null;
    let isCompleted = false;

    if (!isAdmin) {
      if (currentUser) {
        const db = getDatabase();
        enrollment = db
          .prepare(
            "SELECT id, status FROM enrollments WHERE student_id = ? AND course_id = ? AND status IN ('active', 'completed')"
          )
          .get(currentUser.id, lesson.course_id);

        if (enrollment) {
          const progressRow = db
            .prepare('SELECT is_completed FROM lesson_progress WHERE enrollment_id = ? AND lesson_id = ?')
            .get(enrollment.id, lesson.id);

          isCompleted = progressRow ? Boolean(progressRow.is_completed) : false;
        }
      }

      // If not enrolled and not a preview lesson, block access
      if (!enrollment && !isPreview) {
        if (!currentUser) {
          throw new ForbiddenError('You must be logged in and enrolled in this course to view this lesson');
        }
        throw new ForbiddenError('You must be enrolled in this course to access its lesson contents');
      }
    } else if (currentUser) {
      // If admin, check if admin has test enrollment
      const db = getDatabase();
      enrollment = db
        .prepare('SELECT id, status FROM enrollments WHERE student_id = ? AND course_id = ?')
        .get(currentUser.id, lesson.course_id);

      if (enrollment) {
        const progressRow = db
          .prepare('SELECT is_completed FROM lesson_progress WHERE enrollment_id = ? AND lesson_id = ?')
          .get(enrollment.id, lesson.id);
        isCompleted = progressRow ? Boolean(progressRow.is_completed) : false;
      }
    }

    // Determine adjacent navigation (prev / next)
    const siblings = lessonRepository.findByCourseId(lesson.course_id, isAdmin);
    const currentIndex = siblings.findIndex((l) => l.id === lesson.id);
    const prevLesson = currentIndex > 0 ? siblings[currentIndex - 1] : null;
    const nextLesson = currentIndex >= 0 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

    const embedUrl = lesson.video_id ? getYouTubeEmbedUrl(lesson.video_id) : '';

    return {
      lesson: {
        ...lesson,
        videoId: lesson.video_id,
        videoUrl: lesson.video_url,
        channelName: lesson.channel_name,
        topicTitle: lesson.topic_title || '',
        subtopicTitle: lesson.subtopic_title || '',
        practicalExercise: lesson.practical_exercise || '',
        referenceUrls: typeof lesson.reference_urls === 'string' ? JSON.parse(lesson.reference_urls || '[]') : (lesson.reference_urls || []),
        embed_url: embedUrl,
      },
      course: {
        id: course.id,
        title: course.title,
        category: course.category,
      },
      navigation: {
        prevLessonId: prevLesson ? prevLesson.id : null,
        prevLessonTitle: prevLesson ? prevLesson.title : null,
        nextLessonId: nextLesson ? nextLesson.id : null,
        nextLessonTitle: nextLesson ? nextLesson.title : null,
        currentIndex: currentIndex + 1,
        totalLessons: siblings.length,
      },
      enrollmentId: enrollment ? enrollment.id : null,
      isCompleted,
      isPreview,
    };
  }

  createLesson(currentUser, courseId, data) {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new ForbiddenError('Only administrators can create lessons');
    }

    const course = courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const position = data.position || lessonRepository.getMaxPosition(courseId) + 1;

    let videoId = data.videoId || '';
    let videoUrl = data.videoUrl || '';

    if (videoUrl) {
      const extracted = extractYouTubeVideoId(videoUrl);
      if (extracted) {
        videoId = extracted;
        videoUrl = normalizeYouTubeUrl(extracted) || videoUrl;
      }
    } else if (videoId) {
      const extracted = extractYouTubeVideoId(videoId);
      if (extracted) {
        videoId = extracted;
        videoUrl = normalizeYouTubeUrl(extracted) || '';
      }
    }

    const lesson = lessonRepository.createLesson({
      id,
      courseId,
      title: data.title,
      content: data.content || '',
      position,
      status: data.status || 'published',
      videoId,
      videoUrl,
      duration: data.duration || '',
      description: data.description || '',
      channelName: data.channelName || '',
      isPreview: data.isPreview ? 1 : 0,
      topicTitle: data.topicTitle || '',
      subtopicTitle: data.subtopicTitle || '',
      practicalExercise: data.practicalExercise || '',
      referenceUrls: data.referenceUrls || [],
      createdAt: now,
      updatedAt: now,
    });

    logAuditEvent(currentUser.id, 'LESSON_CREATED', 'lesson', id, { courseId, title: lesson.title, videoId });
    return {
      ...lesson,
      embed_url: lesson.video_id ? getYouTubeEmbedUrl(lesson.video_id) : '',
    };
  }

  updateLesson(currentUser, id, data) {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new ForbiddenError('Only administrators can update lessons');
    }

    const existing = lessonRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Lesson not found');
    }

    const fieldsToUpdate = {};
    if (data.title !== undefined) fieldsToUpdate.title = data.title;
    if (data.content !== undefined) fieldsToUpdate.content = data.content;
    if (data.position !== undefined) fieldsToUpdate.position = data.position;
    if (data.status !== undefined) fieldsToUpdate.status = data.status;
    if (data.duration !== undefined) fieldsToUpdate.duration = data.duration;
    if (data.description !== undefined) fieldsToUpdate.description = data.description;
    if (data.channelName !== undefined) fieldsToUpdate.channel_name = data.channelName;
    if (data.isPreview !== undefined) fieldsToUpdate.is_preview = data.isPreview ? 1 : 0;
    if (data.topicTitle !== undefined) fieldsToUpdate.topic_title = data.topicTitle;
    if (data.subtopicTitle !== undefined) fieldsToUpdate.subtopic_title = data.subtopicTitle;
    if (data.practicalExercise !== undefined) fieldsToUpdate.practical_exercise = data.practicalExercise;
    if (data.referenceUrls !== undefined) fieldsToUpdate.reference_urls = data.referenceUrls;

    if (data.videoUrl !== undefined || data.videoId !== undefined) {
      const input = data.videoUrl || data.videoId || '';
      if (input) {
        const extracted = extractYouTubeVideoId(input);
        if (extracted) {
          fieldsToUpdate.video_id = extracted;
          fieldsToUpdate.video_url = normalizeYouTubeUrl(extracted) || input;
        } else {
          fieldsToUpdate.video_id = '';
          fieldsToUpdate.video_url = '';
        }
      } else {
        fieldsToUpdate.video_id = '';
        fieldsToUpdate.video_url = '';
      }
    }

    const updated = lessonRepository.updateLesson(id, fieldsToUpdate);
    logAuditEvent(currentUser.id, 'LESSON_UPDATED', 'lesson', id, fieldsToUpdate);
    return {
      ...updated,
      embed_url: updated.video_id ? getYouTubeEmbedUrl(updated.video_id) : '',
    };
  }

  deleteLesson(currentUser, id) {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new ForbiddenError('Only administrators can delete lessons');
    }

    const existing = lessonRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Lesson not found');
    }

    lessonRepository.deleteLesson(id);
    logAuditEvent(currentUser.id, 'LESSON_DELETED', 'lesson', id, { title: existing.title, courseId: existing.course_id });
    return { success: true, message: 'Lesson deleted successfully.' };
  }
}

export const lessonService = new LessonService();
