import { Router } from 'express';
import { adminController } from './controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();

// Protect all admin routes with authentication and admin role guard
router.use(requireAuth, requireRole('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.get('/reports/enrollments', adminController.getEnrollmentsReport);
router.get('/reports/completions', adminController.getCompletionsReport);
router.get('/reports/progress/:enrollmentId', adminController.getProgressDetails);
router.get('/reports/enrollments/csv', adminController.exportEnrollmentsCsv);
router.get('/reports/completions/csv', adminController.exportCompletionsCsv);
router.get('/health/summary', adminController.getHealthSummary);

export default router;
