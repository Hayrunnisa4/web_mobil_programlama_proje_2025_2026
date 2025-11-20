import { validationResult } from 'express-validator';
import asyncHandler from '../utils/asyncHandler.js';
import {
  borrowResource,
  returnResource,
  requestReturn,
  listLoans,
  listLoansByUser,
} from '../services/loanService.js';

export const borrow = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }
  const loan = await borrowResource({
    tenantId: req.user.tenantId,
    resourceId: req.body.resourceId,
    userId: req.user.sub,
    dueAt: req.body.dueAt,
  });
  res.status(201).json({ status: 'success', data: loan });
});

// Öğrenci iade talebi oluşturur
export const requestReturnLoan = asyncHandler(async (req, res) => {
  const loan = await requestReturn(req.params.id, req.user.tenantId, req.user.sub);
  res.json({ status: 'success', data: loan });
});

// Admin iade talebini onaylar
export const returnLoan = asyncHandler(async (req, res) => {
  const loan = await returnResource(req.params.id, req.user.tenantId, req.user.sub, req.user.role);
  res.json({ status: 'success', data: loan });
});

export const getLoans = asyncHandler(async (req, res) => {
  const loans = await listLoans({
    tenantId: req.user.tenantId,
    status: req.query.status,
  });
  res.json({ status: 'success', data: loans });
});

export const getOwnLoans = asyncHandler(async (req, res) => {
  const loans = await listLoansByUser({
    tenantId: req.user.tenantId,
    userId: req.user.sub,
    status: req.query.status,
  });
  res.json({ status: 'success', data: loans });
});

