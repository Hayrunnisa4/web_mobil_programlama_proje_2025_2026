import { validationResult } from 'express-validator';
import asyncHandler from '../utils/asyncHandler.js';
import { registerUser, authenticateUser } from '../services/userService.js';
import { signToken } from '../utils/token.js';

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }
  const { fullName, email, password, tenantId } = req.body;
  const role =
    req.user?.role === 'admin' && req.body.role ? req.body.role : 'student';
  const user = await registerUser({
    fullName,
    email,
    password,
    role,
    tenantId,
  });
  res.status(201).json({ status: 'success', data: user });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }
  const { email, password, tenantId } = req.body;
  const user = await authenticateUser({ email, password, tenantId });
  const token = signToken({
    sub: user.id,
    role: user.role,
    tenantId: user.tenantId,
  });
  res.json({ status: 'success', data: { user, token } });
});

