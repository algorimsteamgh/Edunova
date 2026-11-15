import crypto from 'node:crypto';
import { enrollmentRepository } from './repository.js';
import { courseRepository } from '../courses/repository.js';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../../utils/errors.js';
import { getDatabase } from '../../database/index.js';
import { logAuditEvent } from '../../utils/auditLogger.js';

export class EnrollmentService {
  async enroll(studentId, courseId) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.status !== 'published') {
      throw new BadRequestError('Cannot enroll in a course that is not currently published', null, 'COURSE_NOT_PUBLISHED');
    }

    const db = getDatabase();
    const enrollmentId = crypto.randomUUID();
    const enrolledAt = new Date().toISOString();

    return db.transaction(async () => {
      const existing = await enrollmentRepository.findByStudentAndCourse(studentId, courseId);
      if (existing) {
        throw new ConflictError('You are already enrolled in this course', { enrollmentId: existing.id }, 'ALREADY_ENROLLED');
      }

      const newEnrollment = await enrollmentRepository.createEnrollment({
        id: enrollmentId,
        studentId,
        courseId,
        enrolledAt,
        status: 'active',
      });

      await logAuditEvent(studentId, 'COURSE_ENROLLED', 'enrollment', enrollmentId, { courseId });
      return newEnrollment;
    });

  }

  async getMyEnrollments(studentId) {
    const rows = await enrollmentRepository.findByStudent(studentId);

    return rows.map((row) => {
      const total = row.total_lessons || 0;
      const completed = row.completed_lessons || 0;
      const progressPercentage = total > 0 ? Math.floor((completed / total) * 100) : 0;

      return {
        ...row,
        totalLessons: total,
        completedLessons: completed,
        progressPercentage,
      };
    });
  }

  async getEnrollmentDetails(studentId, enrollmentId) {
    const enrollment = await enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    if (enrollment.student_id !== studentId) {
      throw new ForbiddenError('You are not authorized to view another student’s enrollment');
    }

    const db = getDatabase();
    const lessons = await db
      .prepare(`
        SELECT 
          l.id, 
          l.title, 
          l.position, 
          l.status,
          COALESCE(lp.is_completed, 0) AS is_completed,
          lp.completed_at
        FROM lessons l
        LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.enrollment_id = ?
        WHERE l.course_id = ? AND l.status = 'published'
        ORDER BY l.position ASC
      `)
      .all(enrollmentId, enrollment.course_id);

    const totalLessons = lessons.length;
    const completedLessons = lessons.filter((l) => Boolean(l.is_completed)).length;
    const progressPercentage = totalLessons > 0 ? Math.floor((completedLessons / totalLessons) * 100) : 0;

    return {
      enrollment,
      totalLessons,
      completedLessons,
      progressPercentage,
      lessons,
    };
  }
}

export const enrollmentService = new EnrollmentService();
