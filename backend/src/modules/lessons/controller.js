import { lessonService } from './service.js';

export class LessonController {
  async list(req, res, next) {
    try {
      const lessons = await lessonService.listLessons(req.user, req.params.courseId);
      res.status(200).json({
        success: true,
        data: { lessons },
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await lessonService.getLesson(req.user, req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const lesson = await lessonService.createLesson(req.user, req.params.courseId, req.body);
      res.status(201).json({
        success: true,
        message: 'Lesson created successfully',
        data: { lesson },
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const lesson = await lessonService.updateLesson(req.user, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Lesson updated successfully',
        data: { lesson },
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await lessonService.deleteLesson(req.user, req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const lessonController = new LessonController();
