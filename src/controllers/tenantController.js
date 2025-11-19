import { validationResult } from 'express-validator';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createTenant,
  deleteTenant,
  listTenants,
  updateTenant,
} from '../services/tenantService.js';

export const listTenantsController = asyncHandler(async (req, res) => {
  const tenants = await listTenants();
  res.json({ status: 'success', data: tenants });
});

export const createTenantController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }
  const tenant = await createTenant(req.body);
  res.status(201).json({ status: 'success', data: tenant });
});

export const updateTenantController = asyncHandler(async (req, res) => {
  const tenant = await updateTenant(req.params.id, req.body);
  res.json({ status: 'success', data: tenant });
});

export const deleteTenantController = asyncHandler(async (req, res) => {
  await deleteTenant(req.params.id);
  res.status(204).send();
});

