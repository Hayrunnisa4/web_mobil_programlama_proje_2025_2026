import pool from '../config/database.js';

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

export async function listTenants() {
  const query = `
    SELECT id, name, slug, contact_email AS "contactEmail", created_at AS "createdAt"
    FROM tenants
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
}

export async function createTenant({ name, slug, contactEmail }) {
  const query = `
    INSERT INTO tenants (name, slug, contact_email)
    VALUES ($1, LOWER($2), $3)
    RETURNING id, name, slug, contact_email AS "contactEmail", created_at AS "createdAt"
  `;
  const { rows } = await pool.query(query, [name, slug, contactEmail]);
  return rows[0];
}

export async function updateTenant(id, updates) {
  const fields = [];
  const values = [];

  if (typeof updates.name !== 'undefined') {
    fields.push(`name = $${fields.length + 2}`);
    values.push(updates.name);
  }
  if (typeof updates.slug !== 'undefined') {
    fields.push(`slug = LOWER($${fields.length + 2})`);
    values.push(updates.slug);
  }
  if (typeof updates.contactEmail !== 'undefined') {
    fields.push(`contact_email = $${fields.length + 2}`);
    values.push(updates.contactEmail);
  }

  if (!fields.length) {
    return getTenantById(id);
  }

  const query = `
    UPDATE tenants SET ${fields.join(', ')}
    WHERE id = $1
    RETURNING id, name, slug, contact_email AS "contactEmail", created_at AS "createdAt"
  `;
  const { rows } = await pool.query(query, [id, ...values]);
  if (!rows.length) {
    const error = new Error('Tenant bulunamadı');
    error.status = 404;
    throw error;
  }
  return rows[0];
}

export async function deleteTenant(id) {
  const query = 'DELETE FROM tenants WHERE id = $1 RETURNING id';
  const { rows } = await pool.query(query, [id]);
  if (!rows.length) {
    const error = new Error('Tenant bulunamadı');
    error.status = 404;
    throw error;
  }
  return true;
}

export async function getTenantBySlug(slug) {
  const query = `
    SELECT id, name, slug, contact_email AS "contactEmail"
    FROM tenants
    WHERE slug = LOWER($1)
  `;
  const { rows } = await pool.query(query, [slug]);
  if (!rows.length) {
    const error = new Error('Geçersiz tenant');
    error.status = 404;
    throw error;
  }
  return rows[0];
}

export async function getTenantById(id) {
  const query = `
    SELECT id, name, slug, contact_email AS "contactEmail", created_at AS "createdAt"
    FROM tenants
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  if (!rows.length) {
    const error = new Error('Tenant bulunamadı');
    error.status = 404;
    throw error;
  }
  return rows[0];
}

export async function resolveTenantId({
  tenantId,
  tenantSlug,
  fallbackTenantId,
} = {}) {
  if (tenantId) {
    return tenantId;
  }
  if (tenantSlug) {
    const tenant = await getTenantBySlug(tenantSlug);
    return tenant.id;
  }
  if (fallbackTenantId) {
    return fallbackTenantId;
  }
  if (DEFAULT_TENANT_ID) {
    return DEFAULT_TENANT_ID;
  }
  const error = new Error('Tenant bilgisi gerekli');
  error.status = 400;
  throw error;
}

