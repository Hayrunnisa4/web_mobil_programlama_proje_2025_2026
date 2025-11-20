import { Router } from 'express';
import authRoutes from './authRoutes.js';
import resourceRoutes from './resourceRoutes.js';
import loanRoutes from './loanRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import reservationRoutes from './reservationRoutes.js';
import reportRoutes from './reportRoutes.js';
import tenantRoutes from './tenantRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resources', resourceRoutes);
router.use('/loans', loanRoutes);
router.use('/reservations', reservationRoutes);
router.use('/reports', reportRoutes);
router.use('/reviews', reviewRoutes);
router.use('/tenants', tenantRoutes);

export default router;

