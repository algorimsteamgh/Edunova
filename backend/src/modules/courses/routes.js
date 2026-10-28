import { Router } from 'express';
import { courseController } from './controller.js';
import { validate } from '../../middleware/validate.js';
import { listCoursesQuerySchema, createCourseSchema, updateCourseSchema } from './validator.js';
import { requireAuth, optionalAuth, requireRole } from '../../middleware/auth.js';

const router = Router();

router.get('/categories', courseController.getCategories);
router.get('/', optionalAuth, validate({ query: listCoursesQuerySchema }), courseController.list);
router.get('/:id', optionalAuth, courseController.getById);

router.post('/', requireAuth, requireRole('admin'), validate({ body: createCourseSchema }), courseController.create);
router.patch('/:id', requireAuth, requireRole('admin'), validate({ body: updateCourseSchema }), courseController.update);
router.delete('/:id', requireAuth, requireRole('admin'), courseController.delete);

export default router;
