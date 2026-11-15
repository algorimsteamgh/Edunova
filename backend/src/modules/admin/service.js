import { stringify } from 'csv-stringify/sync';
import { adminRepository } from './repository.js';
import { ForbiddenError } from '../../utils/errors.js';

export class AdminService {
  ensureAdmin(currentUser) {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new ForbiddenError('Administrative privileges required');
    }
  }

  async getStats(currentUser) {
    this.ensureAdmin(currentUser);
    return await adminRepository.getSystemStats();
  }

  async listUsers(currentUser, query) {
    this.ensureAdmin(currentUser);
    return await adminRepository.listUsers(query);
  }

  async getEnrollmentsReport(currentUser, query) {
    this.ensureAdmin(currentUser);
    return await adminRepository.getEnrollmentsReport(query);
  }

  async getCompletionsReport(currentUser, query) {
    this.ensureAdmin(currentUser);
    return await adminRepository.getCompletionsReport(query);
  }

  async getProgressDetailsReport(currentUser, enrollmentId) {
    this.ensureAdmin(currentUser);
    return await adminRepository.getProgressDetailsReport({ enrollmentId });
  }

  async getHealthSummary(currentUser) {
    this.ensureAdmin(currentUser);
    return await adminRepository.getHealthSummary();
  }

  async exportEnrollmentsCsv(currentUser, query) {
    this.ensureAdmin(currentUser);
    const { report } = await adminRepository.getEnrollmentsReport({ ...query, limit: 10000 });

    const records = report.map((r) => [
      r.enrollment_id,
      r.student_name,
      r.student_email,
      r.course_title,
      r.course_category,
      r.enrolled_at,
      r.enrollment_status,
      r.completed_lessons,
      r.total_lessons,
      `${r.progressPercentage}%`,
    ]);

    return stringify(records, {
      header: true,
      columns: [
        'Enrollment ID',
        'Student Name',
        'Student Email',
        'Course Title',
        'Category',
        'Enrolled At',
        'Status',
        'Completed Lessons',
        'Total Lessons',
        'Progress',
      ],
    });
  }

  async exportCompletionsCsv(currentUser, query) {
    this.ensureAdmin(currentUser);
    const { report } = await adminRepository.getCompletionsReport({ ...query, limit: 10000 });

    const records = report.map((r) => [
      r.enrollment_id,
      r.student_name,
      r.student_email,
      r.course_title,
      r.course_category,
      r.enrolled_at,
      r.completed_at || 'N/A',
    ]);

    return stringify(records, {
      header: true,
      columns: [
        'Enrollment ID',
        'Student Name',
        'Student Email',
        'Course Title',
        'Category',
        'Enrolled At',
        'Completed At',
      ],
    });
  }
}

export const adminService = new AdminService();
