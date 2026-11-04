import { Router } from 'express';
import { roadmapController } from './controller.js';
import { requireAuth, optionalAuth, requireRole } from '../../middleware/auth.js';

const router = Router();

// Public & Learner Discovery Endpoints
router.get('/', optionalAuth, roadmapController.list);
router.get('/search/global', optionalAuth, roadmapController.searchGlobal);
router.get('/student/dashboard', requireAuth, roadmapController.getStudentDashboard);
router.get('/my/enrolled', requireAuth, roadmapController.getMyRoadmaps);

// Specific Topic Learning Page endpoints (both direct topic and roadmap-scoped topic)
router.get('/topics/:topicId', optionalAuth, roadmapController.getTopicDetails);
router.get('/:roadmapId/topics/:topicId', optionalAuth, roadmapController.getTopicDetails);

// Single Roadmap Overview & Canvas
router.get('/:idOrSlug', optionalAuth, roadmapController.getByIdOrSlug);
router.post('/:id/enroll', requireAuth, roadmapController.enroll);

// Progress & Video Tracking
router.post('/topics/:topicId/progress', requireAuth, roadmapController.updateTopicProgress);
router.put('/topics/:topicId/progress', requireAuth, roadmapController.updateTopicProgress);
router.post('/topics/:topicId/video-progress', requireAuth, roadmapController.updateVideoProgress);
router.put('/topics/:topicId/video-progress', requireAuth, roadmapController.updateVideoProgress);

// Admin Content Management Endpoints
router.get('/admin/missing-resources', requireAuth, requireRole('admin'), roadmapController.adminGetMissingResources);
router.post('/admin/create', requireAuth, requireRole('admin'), roadmapController.adminCreateRoadmap);
router.put('/admin/:id', requireAuth, requireRole('admin'), roadmapController.adminUpdateRoadmap);
router.delete('/admin/:id', requireAuth, requireRole('admin'), roadmapController.adminDeleteRoadmap);
router.post('/admin/:roadmapId/modules', requireAuth, requireRole('admin'), roadmapController.adminCreateModule);
router.put('/admin/modules/:id', requireAuth, requireRole('admin'), roadmapController.adminUpdateModule);
router.delete('/admin/modules/:id', requireAuth, requireRole('admin'), roadmapController.adminDeleteModule);
router.post('/admin/:roadmapId/topics', requireAuth, requireRole('admin'), roadmapController.adminCreateTopic);
router.put('/admin/topics/:id', requireAuth, requireRole('admin'), roadmapController.adminUpdateTopic);
router.delete('/admin/topics/:id', requireAuth, requireRole('admin'), roadmapController.adminDeleteTopic);

export default router;
