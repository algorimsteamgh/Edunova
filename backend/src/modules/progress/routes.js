import { Router } from 'express';
import { progressController } from './controller.js';
import { validate } from '../../middleware/validate.js';
import { updateProgressSchema } from './validator.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router({ mergeParams: true });

router.put('/:enrollmentId/lessons/:lessonId/progress', requireAuth, validate({ body: updateProgressSchema }), progressController.updateProgress);
router.get('/:enrollmentId/progress', requireAuth, progressController.getProgress);

export default router;
