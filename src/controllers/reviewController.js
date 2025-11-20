import { validationResult } from 'express-validator';
import asyncHandler from '../utils/asyncHandler.js';
import { createReview, getReviewsByResource, getReviewByLoan } from '../services/reviewService.js';

export const createReviewController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }
  const review = await createReview({
    tenantId: req.user.tenantId,
    resourceId: req.body.resourceId,
    userId: req.user.sub,
    loanId: req.body.loanId,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  res.status(201).json({ status: 'success', data: review });
});

export const getReviewsController = asyncHandler(async (req, res) => {
  const reviews = await getReviewsByResource({
    tenantId: req.user.tenantId,
    resourceId: req.params.resourceId,
  });
  res.json({ status: 'success', data: reviews });
});

export const getReviewByLoanController = asyncHandler(async (req, res) => {
  const review = await getReviewByLoan({
    tenantId: req.user.tenantId,
    loanId: req.params.loanId,
  });
  res.json({ status: 'success', data: review });
});
