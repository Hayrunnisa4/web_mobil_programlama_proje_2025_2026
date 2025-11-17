import pool from '../config/database.js';

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

export async function borrowResource({
  tenantId = DEFAULT_TENANT_ID,
  resourceId,
  userId,
  dueAt,
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resourceQuery = `
      SELECT id, available_stock AS "availableStock"
      FROM resources
      WHERE id = $1 AND tenant_id = $2
      FOR UPDATE
    `;
    const resourceResult = await client.query(resourceQuery, [resourceId, tenantId]);
    if (!resourceResult.rows.length) {
      const error = new Error('Kaynak bulunamadı');
      error.status = 404;
      throw error;
    }
    const resource = resourceResult.rows[0];
    if (resource.availableStock <= 0) {
      const error = new Error('Kaynak stokta yok, rezervasyon oluşturabilirsiniz');
      error.status = 409;
      throw error;
    }

    const loanQuery = `
      INSERT INTO loans (tenant_id, resource_id, user_id, due_at, status)
      VALUES ($1, $2, $3, $4, 'borrowed')
      RETURNING id, resource_id AS "resourceId", user_id AS "userId",
                borrowed_at AS "borrowedAt", due_at AS "dueAt", status
    `;
    const { rows } = await client.query(loanQuery, [
      tenantId,
      resourceId,
      userId,
      dueAt,
    ]);

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function returnResource(loanId, tenantId = DEFAULT_TENANT_ID) {
  const query = `
    UPDATE loans
    SET status = 'returned', returned_at = NOW()
    WHERE id = $1 AND tenant_id = $2 AND status = 'borrowed'
    RETURNING id, resource_id AS "resourceId", user_id AS "userId",
              borrowed_at AS "borrowedAt", due_at AS "dueAt", returned_at AS "returnedAt", status
  `;
  const { rows } = await pool.query(query, [loanId, tenantId]);
  if (!rows.length) {
    const error = new Error('Aktif ödünç kaydı bulunamadı');
    error.status = 404;
    throw error;
  }
  return rows[0];
}

export async function listLoans({
  tenantId = DEFAULT_TENANT_ID,
  status,
}) {
  const conditions = ['l.tenant_id = $1'];
  const values = [tenantId];
  if (status) {
    conditions.push('l.status = $2');
    values.push(status);
  }
  const query = `
    SELECT l.id, l.status, l.borrowed_at AS "borrowedAt", l.due_at AS "dueAt",
           l.returned_at AS "returnedAt",
           r.title AS "resourceTitle",
           u.full_name AS "userName",
           u.email AS "userEmail"
    FROM loans l
    JOIN resources r ON r.id = l.resource_id
    JOIN users u ON u.id = l.user_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY l.borrowed_at DESC
  `;
  const { rows } = await pool.query(query, values);
  return rows;
}

