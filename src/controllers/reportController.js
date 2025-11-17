import asyncHandler from '../utils/asyncHandler.js';
import { getOverdueLoans, getTopBorrowedResources } from '../services/reportService.js';

export const overdueReport = asyncHandler(async (req, res) => {
  const data = await getOverdueLoans(req.user.tenantId);
  res.json({ status: 'success', data });
});

export const topBorrowedReport = asyncHandler(async (req, res) => {
  const data = await getTopBorrowedResources(req.user.tenantId);
  res.json({ status: 'success', data });
});

