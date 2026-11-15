import crypto from 'node:crypto';
import { progressRepository } from './repository.js';
import { enrollmentRepository } from '../enrollments/repository.js';
import { lessonRepository } from '../lessons/repository.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors.js';
import { getDatabase } from '../../database/index.js';
import { logAuditEvent } from '../../utils/auditLogger.js';

export class ProgressService {
  async updateLessonProgress(currentUser, enrollmentId, lessonId, isCompleted) {
    const enrollment = await enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError('Enrollment record not found');
    }

    // Security Check: Student can only update their own progress
    const isAdmin = currentUser.role === 'admin';
    if (!isAdmin && enrollment.student_id !== currentUser.id) {
      throw new ForbiddenError('You cannot modify progress for another student’s enrollment');
    }

    const lesson = await lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }

    // Critical Cross-Course Safety Enforcement:
    // Assert that the lesson belongs strictly to the course the student enrolled in!
    if (lesson.course_id !== enrollment.course_id) {
      throw new BadRequestError(
        'Lesson does not belong to the course for this enrollment',
        { enrollmentCourseId: enrollment.course_id, lessonCourseId: lesson.course_id },
        'CROSS_COURSE_PROGRESS_FORGERY'
      );
    }

    const db = getDatabase();
    const now = new Date().toISOString();
    const completedAt = isCompleted ? now : null;

    return db.transaction(async () => {
      // 1. Upsert progress record
      const id = crypto.randomUUID();
      const progressRecord = await progressRepository.upsertLessonProgress({
        id,
        enrollmentId,
        lessonId,
        isCompleted,
        completedAt,
        updatedAt: now,
      });

      // 2. Compute updated course progress
      const totalPublished = await progressRepository.countPublishedLessons(enrollment.course_id);
      const totalCompleted = await progressRepository.countCompletedLessons(enrollmentId, enrollment.course_id);

      const progressPercentage = totalPublished > 0 ? Math.floor((totalCompleted / totalPublished) * 100) : 0;

      // 3. Update enrollment completion status atomically
      let newEnrollmentStatus = enrollment.status;
      if (totalPublished > 0 && totalCompleted === totalPublished) {
        newEnrollmentStatus = 'completed';
        await enrollmentRepository.updateStatus(enrollmentId, 'completed');
        await logAuditEvent(currentUser.id, 'COURSE_COMPLETED', 'enrollment', enrollmentId, {
          courseId: enrollment.course_id,
          completedLessons: totalCompleted,
        });
      } else if (enrollment.status === 'completed' && totalCompleted < totalPublished) {
        // If previously completed but lesson uncompleted, transition back to active
        newEnrollmentStatus = 'active';
        await enrollmentRepository.updateStatus(enrollmentId, 'active');
      }

      await logAuditEvent(currentUser.id, 'PROGRESS_UPDATED', 'lesson_progress', progressRecord.id, {
        enrollmentId,
        lessonId,
        isCompleted,
        progressPercentage,
      });

      return {
        progress: progressRecord,
        totalLessons: totalPublished,
        completedLessons: totalCompleted,
        progressPercentage,
        enrollmentStatus: newEnrollmentStatus,
      };
    });

  }

  async getProgress(currentUser, enrollmentId) {
    const enrollment = await enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError('Enrollment record not found');
    }

    const isAdmin = currentUser.role === 'admin';
    if (!isAdmin && enrollment.student_id !== currentUser.id) {
      throw new ForbiddenError('You cannot view progress for another student’s enrollment');
    }

    const summary = await progressRepository.getProgressSummary(enrollmentId);
    const total = summary ? summary.total_lessons || 0 : 0;
    const completed = summary ? summary.completed_lessons || 0 : 0;
    const progressPercentage = total > 0 ? Math.floor((completed / total) * 100) : 0;

    return {
      enrollmentId,
      courseId: enrollment.course_id,
      courseTitle: enrollment.course_title,
      totalLessons: total,
      completedLessons: completed,
      progressPercentage,
      status: enrollment.status,
    };
  }
}

export const progressService = new ProgressService();
