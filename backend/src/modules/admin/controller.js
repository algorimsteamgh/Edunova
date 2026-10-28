import { adminService } from './service.js';

export class AdminController {
  async getStats(req, res, next) {
    try {
      const stats = adminService.getStats(req.user);
      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (err) {
      next(err);
    }
  }

  async listUsers(req, res, next) {
    try {
      const result = adminService.listUsers(req.user, req.query);
      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getEnrollmentsReport(req, res, next) {
    try {
      const result = adminService.getEnrollmentsReport(req.user, req.query);
      res.status(200).json({
        success: true,
        data: result.report,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCompletionsReport(req, res, next) {
    try {
      const result = adminService.getCompletionsReport(req.user, req.query);
      res.status(200).json({
        success: true,
        data: result.report,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getProgressDetails(req, res, next) {
    try {
      const details = adminService.getProgressDetailsReport(req.user, req.params.enrollmentId);
      res.status(200).json({
        success: true,
        data: { details },
      });
    } catch (err) {
      next(err);
    }
  }

  async getHealthSummary(req, res, next) {
    try {
      const summary = adminService.getHealthSummary(req.user);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  async exportEnrollmentsCsv(req, res, next) {
    try {
      const csvData = adminService.exportEnrollmentsCsv(req.user, req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="enrollments-report.csv"');
      res.status(200).send(csvData);
    } catch (err) {
      next(err);
    }
  }

  async exportCompletionsCsv(req, res, next) {
    try {
      const csvData = adminService.exportCompletionsCsv(req.user, req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="completions-report.csv"');
      res.status(200).send(csvData);
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
