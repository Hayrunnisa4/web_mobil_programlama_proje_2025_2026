import { Router } from 'express';
import { body } from 'express-validator';
import { login, register } from '../controllers/authController.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

const emailValidator = body('email').isEmail().withMessage('Geçerli bir email giriniz');
const passwordValidator = body('password')
  .isLength({ min: 6 })
  .withMessage('Şifre en az 6 karakter olmalıdır');
const tenantSlugValidator = body('tenantSlug')
  .optional()
  .matches(/^[a-z0-9-]+$/)
  .withMessage('tenantSlug küçük harf, sayı ve tire içermelidir');
const tenantIdValidator = body('tenantId')
  .optional()
  .isUUID()
  .withMessage('tenantId UUID formatında olmalıdır');

router.post(
  '/register',
  optionalAuthenticate,
  [
    body('fullName').notEmpty().withMessage('İsim alanı zorunlu'),
    emailValidator,
    passwordValidator,
    tenantSlugValidator,
    tenantIdValidator,
  ],
  register,
);

router.post(
  '/login',
  [
    emailValidator,
    passwordValidator,
    tenantSlugValidator,
    tenantIdValidator,
    body().custom((_, { req }) => {
      if (!req.body.tenantId && !req.body.tenantSlug) {
        throw new Error('tenantId veya tenantSlug alanlarından biri zorunlu');
      }
      return true;
    }),
  ],
  login,
);

export default router;

