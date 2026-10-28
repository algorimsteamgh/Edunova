import { courseService } from './service.js';

export class CourseController {
  async list(req, res, next) {
    try {
      const result = courseService.listCourses(req.user, req.query);
      res.status(200).json({
        success: true,
        data: result.courses,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = courseService.getCourseDetails(req.user, req.params.id);
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
      const course = courseService.createCourse(req.user, req.body);
      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: { course },
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const course = courseService.updateCourse(req.user, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: { course },
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = courseService.deleteOrArchiveCourse(req.user, req.params.id);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCategories(_req, res, next) {
    try {
      const categories = courseService.getCategories();
      res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const courseController = new CourseController();
