import { Router } from 'express';
import { body } from 'express-validator';
import {
  createReviewController,
  getReviewsController,
  getReviewByLoanController,
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/resource/:resourceId', authenticate, getReviewsController);
router.get('/loan/:loanId', authenticate, authorize('student', 'admin'), getReviewByLoanController);

router.post(
  '/',
  authenticate,
  authorize('student', 'admin'),
  [
    body('resourceId').isUUID().withMessage('Geçerli bir resourceId gerekli'),
    body('loanId').isUUID().withMessage('Geçerli bir loanId gerekli'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Puan 1-5 arasında bir tam sayı olmalıdır'),
    body('comment').optional().isString().withMessage('Yorum metin olmalıdır'),
  ],
  createReviewController,
);

export default router;
