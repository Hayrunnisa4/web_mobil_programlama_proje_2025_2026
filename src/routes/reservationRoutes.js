import { Router } from 'express';
import { body } from 'express-validator';
import {
  createReservationController,
  listReservationsController,
  listOwnReservationsController,
  updateReservationController,
} from '../controllers/reservationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), listReservationsController);
router.get('/me', authenticate, authorize('student', 'admin'), listOwnReservationsController);

router.post(
  '/',
  authenticate,
  authorize('student', 'admin'),
  [body('resourceId').isUUID().withMessage('Geçerli bir resourceId gerekli')],
  createReservationController,
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  [body('status').isIn(['waiting', 'notified', 'fulfilled', 'cancelled'])],
  updateReservationController,
);

export default router;

