import { Router } from 'express';
import { body } from 'express-validator';
import {
  createTenantController,
  deleteTenantController,
  listTenantsController,
  updateTenantController,
} from '../controllers/tenantController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

const tenantValidators = [
  body('name').notEmpty().withMessage('Tenant adı zorunlu'),
  body('slug')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug yalnızca küçük harf, sayı ve tire içerebilir'),
  body('contactEmail').optional().isEmail().withMessage('Geçerli email giriniz'),
];

router.use(authenticate, authorize('admin'));

router.get('/', listTenantsController);
router.post('/', tenantValidators, createTenantController);
router.put('/:id', updateTenantController);
router.delete('/:id', deleteTenantController);

export default router;

