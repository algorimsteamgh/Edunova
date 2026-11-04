import { Router } from 'express';
import { bookmarkController } from './controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/my/bookmarks', requireAuth, bookmarkController.list);
router.post('/lessons/:lessonId/bookmark', requireAuth, bookmarkController.toggle);

export default router;

