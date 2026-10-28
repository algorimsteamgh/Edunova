import { progressService } from './service.js';

export class ProgressController {
  async updateProgress(req, res, next) {
    try {
      const { enrollmentId, lessonId } = req.params;
      const { isCompleted } = req.body;
      const result = progressService.updateLessonProgress(req.user, enrollmentId, lessonId, isCompleted);

      res.status(200).json({
        success: true,
        message: 'Lesson progress updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getProgress(req, res, next) {
    try {
      const { enrollmentId } = req.params;
      const result = progressService.getProgress(req.user, enrollmentId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const progressController = new ProgressController();
