import { Router } from 'express';
import { body } from 'express-validator';
import { login, register } from '../controllers/authController.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

const emailValidator = body('email').isEmail().withMessage('Geçerli bir email giriniz');
const passwordValidator = body('password')
  .isLength({ min: 6 })
  .withMessage('Şifre en az 6 karakter olmalıdır');

router.post(
  '/register',
  optionalAuthenticate,
  [
    body('fullName').notEmpty().withMessage('İsim alanı zorunlu'),
    emailValidator,
    passwordValidator,
  ],
  register,
);

router.post('/login', [emailValidator, passwordValidator], login);

export default router;

