import { validationResult } from 'express-validator';
import asyncHandler from '../utils/asyncHandler.js';
import { registerUser, authenticateUser } from '../services/userService.js';
import { signToken } from '../utils/token.js';

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }
  const { fullName, email, password, tenantId, tenantSlug, role: requestedRole } = req.body;
  
  // Admin oluşturmak için admin token'ı zorunlu
  let finalRole = 'student';
  if (requestedRole === 'admin') {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin kullanıcı oluşturmak için admin yetkisi gereklidir',
      });
    }
    finalRole = 'admin';
  } else if (requestedRole && requestedRole !== 'student') {
    return res.status(400).json({
      status: 'error',
      message: 'Geçersiz rol. Sadece student veya admin (admin token ile) seçilebilir',
    });
  }

  const user = await registerUser({
    fullName,
    email,
    password,
    role: finalRole,
    tenantId,
    tenantSlug,
    fallbackTenantId: req.user?.tenantId,
  });
  res.status(201).json({ status: 'success', data: user });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }
  const { email, password, tenantId, tenantSlug } = req.body;
  const user = await authenticateUser({
    email,
    password,
    tenantId,
    tenantSlug,
  });
  const token = signToken({
    sub: user.id,
    role: user.role,
    tenantId: user.tenantId,
  });
  res.json({ status: 'success', data: { user, token } });
});

