import { Router } from 'express';
import { body } from 'express-validator';
import { borrow, getLoans, returnLoan } from '../controllers/loanController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), getLoans);

router.post(
  '/',
  authenticate,
  authorize('student', 'admin'),
  [
    body('resourceId').isUUID().withMessage('Geçerli bir resourceId gerekli'),
    body('dueAt').isISO8601().withMessage('dueAt ISO tarih formatında olmalı'),
  ],
  borrow,
);

router.post('/:id/return', authenticate, authorize('admin'), returnLoan);

export default router;

