import { validationResult } from 'express-validator';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createReservation,
  listReservations,
  updateReservationStatus,
} from '../services/reservationService.js';

export const createReservationController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }
  const reservation = await createReservation({
    tenantId: req.user.tenantId,
    resourceId: req.body.resourceId,
    userId: req.user.sub,
  });
  res.status(201).json({ status: 'success', data: reservation });
});

export const listReservationsController = asyncHandler(async (req, res) => {
  const reservations = await listReservations({ tenantId: req.user.tenantId });
  res.json({ status: 'success', data: reservations });
});

export const updateReservationController = asyncHandler(async (req, res) => {
  const reservation = await updateReservationStatus(
    req.params.id,
    req.body.status,
    req.user.tenantId,
  );
  res.json({ status: 'success', data: reservation });
});

