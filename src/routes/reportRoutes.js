import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { overdueReport, topBorrowedReport } from '../controllers/reportController.js';

const router = Router();

router.get('/overdue', authenticate, authorize('admin'), overdueReport);
router.get('/top-borrowed', authenticate, authorize('admin'), topBorrowedReport);

export default router;

