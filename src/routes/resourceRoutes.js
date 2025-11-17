import { Router } from 'express';
import { body } from 'express-validator';
import {
  createResourceController,
  deleteResourceController,
  getResource,
  getResources,
  updateResourceController,
} from '../controllers/resourceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getResources);
router.get('/:id', authenticate, getResource);

const resourceValidators = [
  body('title').notEmpty().withMessage('Başlık zorunlu'),
  body('totalStock').optional().isInt({ min: 1 }).withMessage('Stok 1 ve üzeri olmalıdır'),
];

router.post('/', authenticate, authorize('admin'), resourceValidators, createResourceController);
router.put('/:id', authenticate, authorize('admin'), updateResourceController);
router.delete('/:id', authenticate, authorize('admin'), deleteResourceController);

export default router;

