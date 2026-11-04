import { Router } from 'express';
import { quizController } from './controller.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/lessons/:lessonId/quiz', optionalAuth, quizController.getByLesson);
router.post('/quizzes/:quizId/submit', requireAuth, quizController.submit);

export default router;

