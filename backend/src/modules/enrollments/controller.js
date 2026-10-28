import { enrollmentService } from './service.js';

export class EnrollmentController {
  async enroll(req, res, next) {
    try {
      const enrollment = enrollmentService.enroll(req.user.id, req.params.courseId);
      res.status(201).json({
        success: true,
        message: 'Enrolled in course successfully',
        data: { enrollment },
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyEnrollments(req, res, next) {
    try {
      const enrollments = enrollmentService.getMyEnrollments(req.user.id);
      res.status(200).json({
        success: true,
        data: { enrollments },
      });
    } catch (err) {
      next(err);
    }
  }

  async getEnrollmentById(req, res, next) {
    try {
      const result = enrollmentService.getEnrollmentDetails(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const enrollmentController = new EnrollmentController();
