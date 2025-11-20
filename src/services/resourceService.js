import pool from '../config/database.js';

export async function listResources({ tenantId, filters = {} }) {
  if (!tenantId) {
    const error = new Error('Tenant bilgisi gerekli');
    error.status = 400;
    throw error;
  }
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
    } else if (key === 'availableOnly' && value === true) {
      conditions.push('available_stock > 0');
      idx -= 1;
    } else if (key === 'search' && value) {
      const placeholder = idx;
      conditions.push(
        `(LOWER(title) LIKE $${placeholder} OR LOWER(author) LIKE $${placeholder} OR LOWER(topic) LIKE $${placeholder})`,
      );
      values.push(`%${value.toLowerCase()}%`);
    } else if (key === 'sortBy') {
      idx -= 1;
    }
  });

  let orderBy = 'created_at DESC';
  if (filters.sortBy === 'title') {
    orderBy = 'LOWER(title) ASC';
  } else if (filters.sortBy === 'availability') {
    orderBy = 'available_stock DESC';
  } else if (filters.sortBy === 'topic') {
    orderBy = 'LOWER(topic) ASC';
  }

  const query = `
    SELECT id, title, author, topic, difficulty, total_stock AS "totalStock",
           available_stock AS "availableStock", description, image_url AS "imageUrl",
           created_at AS "createdAt"
    FROM resources
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${orderBy}
  `;

  const { rows } = await pool.query(query, values);
  return rows;
}

export async function createResource({
  tenantId,
  title,
  author,
  topic,
  difficulty,
  totalStock = 1,
  description,
  imageUrl,
}) {
  if (!tenantId) {
    const error = new Error('Tenant bilgisi gerekli');
    error.status = 400;
    throw error;
  }
  const query = `
    INSERT INTO resources (tenant_id, title, author, topic, difficulty, total_stock, available_stock, description, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8)
    RETURNING id, title, author, topic, difficulty, total_stock AS "totalStock",
              available_stock AS "availableStock", description, image_url AS "imageUrl"
  `;
  const { rows } = await pool.query(query, [
    tenantId,
    title,
    author,
    topic,
    difficulty,
    totalStock,
    description,
    imageUrl,
  ]);
  return rows[0];
}

export async function updateResource(id, tenantId, updates) {
  if (!tenantId) {
    const error = new Error('Tenant bilgisi gerekli');
    error.status = 400;
    throw error;
  }
  const setClauses = [];
  const values = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (typeof value === 'undefined') return;
    let column = key;
    if (key === 'totalStock') column = 'total_stock';
    if (key === 'availableStock') column = 'available_stock';
    if (key === 'imageUrl') column = 'image_url';
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
              available_stock AS "availableStock", description, image_url AS "imageUrl"
  `;
  const { rows } = await pool.query(query, [id, tenantId, ...values]);
  if (!rows.length) {
    const error = new Error('Kaynak bulunamadı');
    error.status = 404;
    throw error;
  }
  return rows[0];
}

export async function deleteResource(id, tenantId) {
  if (!tenantId) {
    const error = new Error('Tenant bilgisi gerekli');
    error.status = 400;
    throw error;
  }
  const query = 'DELETE FROM resources WHERE id = $1 AND tenant_id = $2 RETURNING id';
  const { rows } = await pool.query(query, [id, tenantId]);
  if (!rows.length) {
    const error = new Error('Kaynak bulunamadı');
    error.status = 404;
    throw error;
  }
  return true;
}

export async function getResourceById(id, tenantId) {
  if (!tenantId) {
    const error = new Error('Tenant bilgisi gerekli');
    error.status = 400;
    throw error;
  }
  const query = `
    SELECT id, title, author, topic, difficulty, total_stock AS "totalStock",
           available_stock AS "availableStock", description, image_url AS "imageUrl"
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

