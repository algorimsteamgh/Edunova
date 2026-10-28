import { Router } from 'express';
import { authController } from './controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from './validator.js';
import { requireAuth } from '../../middleware/auth.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
