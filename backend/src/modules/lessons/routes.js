import { Router } from 'express';
import { lessonController } from './controller.js';
import { validate } from '../../middleware/validate.js';
import { createLessonSchema, updateLessonSchema } from './validator.js';
import { requireAuth, optionalAuth, requireRole } from '../../middleware/auth.js';

// Route setup: notice we mount routes both under `/courses/:courseId/lessons` and `/lessons/:id`
export const courseLessonsRouter = Router({ mergeParams: true });
courseLessonsRouter.get('/', optionalAuth, lessonController.list);
courseLessonsRouter.post('/', requireAuth, requireRole('admin'), validate({ body: createLessonSchema }), lessonController.create);

export const lessonsRouter = Router();
lessonsRouter.get('/:id', optionalAuth, lessonController.getById);
lessonsRouter.patch('/:id', requireAuth, requireRole('admin'), validate({ body: updateLessonSchema }), lessonController.update);
lessonsRouter.delete('/:id', requireAuth, requireRole('admin'), lessonController.delete);
