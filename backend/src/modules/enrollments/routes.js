import { Router } from 'express';
import { enrollmentController } from './controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const myEnrollmentsRouter = Router();
myEnrollmentsRouter.get('/', requireAuth, enrollmentController.getMyEnrollments);
myEnrollmentsRouter.get('/:id', requireAuth, enrollmentController.getEnrollmentById);

export const courseEnrollRouter = Router({ mergeParams: true });
courseEnrollRouter.post('/', requireAuth, enrollmentController.enroll);
