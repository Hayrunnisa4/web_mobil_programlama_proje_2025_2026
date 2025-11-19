import { validationResult } from 'express-validator';
import asyncHandler from '../utils/asyncHandler.js';
import {
  listResources,
  createResource,
  updateResource,
  deleteResource,
  getResourceById,
} from '../services/resourceService.js';
import { resolveTenantId } from '../services/tenantService.js';

export const getResources = asyncHandler(async (req, res) => {
  const filters = {
    title: req.query.title,
    author: req.query.author,
    topic: req.query.topic,
    difficulty: req.query.difficulty,
    search: req.query.q,
    availableOnly: ['true', '1', 'yes'].includes(
      String(req.query.availableOnly).toLowerCase(),
    ),
    sortBy: req.query.sortBy,
  };
  const tenantId = await resolveTenantId({
    tenantId: req.user?.tenantId || req.query.tenantId,
    tenantSlug: req.query.tenantSlug,
  });
  const resources = await listResources({
    tenantId,
    filters,
  });
  res.json({ status: 'success', data: resources });
});

export const createResourceController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }
  const resource = await createResource({
    tenantId: req.user?.tenantId,
    ...req.body,
  });
  res.status(201).json({ status: 'success', data: resource });
});

export const getResource = asyncHandler(async (req, res) => {
  const tenantId = await resolveTenantId({
    tenantId: req.user?.tenantId || req.query.tenantId,
    tenantSlug: req.query.tenantSlug,
  });
  const resource = await getResourceById(req.params.id, tenantId);
  res.json({ status: 'success', data: resource });
});

export const updateResourceController = asyncHandler(async (req, res) => {
  const resource = await updateResource(req.params.id, req.user?.tenantId, req.body);
  res.json({ status: 'success', data: resource });
});

export const deleteResourceController = asyncHandler(async (req, res) => {
  await deleteResource(req.params.id, req.user?.tenantId);
  res.status(204).send();
});

