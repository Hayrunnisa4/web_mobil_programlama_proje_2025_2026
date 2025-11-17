import pool from '../config/database.js';

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

export async function listResources({
  tenantId = DEFAULT_TENANT_ID,
  filters = {},
}) {
  const conditions = ['tenant_id = $1'];
  const values = [tenantId];
  let idx = values.length;

  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;
    idx += 1;
    if (['title', 'author', 'topic'].includes(key)) {
      conditions.push(`LOWER(${key}) LIKE $${idx}`);
      values.push(`%${value.toLowerCase()}%`);
    } else if (key === 'difficulty') {
      conditions.push(`${key} = $${idx}`);
      values.push(value);
    }
  });

  const query = `
    SELECT id, title, author, topic, difficulty, total_stock AS "totalStock",
           available_stock AS "availableStock", description, created_at AS "createdAt"
    FROM resources
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
  `;

  const { rows } = await pool.query(query, values);
  return rows;
}

export async function createResource({
  tenantId = DEFAULT_TENANT_ID,
  title,
  author,
  topic,
  difficulty,
  totalStock = 1,
  description,
}) {
  const query = `
    INSERT INTO resources (tenant_id, title, author, topic, difficulty, total_stock, available_stock, description)
    VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
    RETURNING id, title, author, topic, difficulty, total_stock AS "totalStock",
              available_stock AS "availableStock", description
  `;
  const { rows } = await pool.query(query, [
    tenantId,
    title,
    author,
    topic,
    difficulty,
    totalStock,
    description,
  ]);
  return rows[0];
}

export async function updateResource(id, tenantId, updates) {
  const setClauses = [];
  const values = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (typeof value === 'undefined') return;
    let column = key;
    if (key === 'totalStock') column = 'total_stock';
    if (key === 'availableStock') column = 'available_stock';
    setClauses.push(`${column} = $${setClauses.length + 3}`);
    values.push(value);
  });

  if (!setClauses.length) {
    return getResourceById(id, tenantId);
  }

  const query = `
    UPDATE resources
    SET ${setClauses.join(', ')}
    WHERE id = $1 AND tenant_id = $2
    RETURNING id, title, author, topic, difficulty, total_stock AS "totalStock",
              available_stock AS "availableStock", description
  `;
  const { rows } = await pool.query(query, [id, tenantId, ...values]);
  if (!rows.length) {
    const error = new Error('Kaynak bulunamadı');
    error.status = 404;
    throw error;
  }
  return rows[0];
}

export async function deleteResource(id, tenantId = DEFAULT_TENANT_ID) {
  const query = 'DELETE FROM resources WHERE id = $1 AND tenant_id = $2 RETURNING id';
  const { rows } = await pool.query(query, [id, tenantId]);
  if (!rows.length) {
    const error = new Error('Kaynak bulunamadı');
    error.status = 404;
    throw error;
  }
  return true;
}

export async function getResourceById(id, tenantId = DEFAULT_TENANT_ID) {
  const query = `
    SELECT id, title, author, topic, difficulty, total_stock AS "totalStock",
           available_stock AS "availableStock", description
    FROM resources
    WHERE id = $1 AND tenant_id = $2
  `;
  const { rows } = await pool.query(query, [id, tenantId]);
  if (!rows.length) {
    const error = new Error('Kaynak bulunamadı');
    error.status = 404;
    throw error;
  }
  return rows[0];
}

