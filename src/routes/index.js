import { Router } from 'express';
import authRoutes from './authRoutes.js';
import resourceRoutes from './resourceRoutes.js';
import loanRoutes from './loanRoutes.js';
import reservationRoutes from './reservationRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resources', resourceRoutes);
router.use('/loans', loanRoutes);
router.use('/reservations', reservationRoutes);
router.use('/reports', reportRoutes);

export default router;

