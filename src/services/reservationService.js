import pool from '../config/database.js';

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

export async function createReservation({
  tenantId = DEFAULT_TENANT_ID,
  resourceId,
  userId,
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const countQuery = `
      SELECT COALESCE(MAX(position), 0) + 1 AS "nextPosition"
      FROM reservations
      WHERE resource_id = $1 AND tenant_id = $2 AND status IN ('waiting', 'notified')
    `;
    const { rows: countRows } = await client.query(countQuery, [resourceId, tenantId]);
    const position = countRows[0].nextPosition;

    const insertQuery = `
      INSERT INTO reservations (tenant_id, resource_id, user_id, status, position)
      VALUES ($1, $2, $3, 'waiting', $4)
      RETURNING id, resource_id AS "resourceId", user_id AS "userId", status, position, created_at AS "createdAt"
    `;
    const { rows } = await client.query(insertQuery, [
      tenantId,
      resourceId,
      userId,
      position,
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

export async function listReservations({ tenantId = DEFAULT_TENANT_ID }) {
  const query = `
    SELECT res.id, res.status, res.position, res.created_at AS "createdAt",
           r.title AS "resourceTitle",
           u.full_name AS "userName",
           u.email AS "userEmail"
    FROM reservations res
    JOIN resources r ON r.id = res.resource_id
    JOIN users u ON u.id = res.user_id
    WHERE res.tenant_id = $1
    ORDER BY res.created_at ASC
  `;
  const { rows } = await pool.query(query, [tenantId]);
  return rows;
}

export async function updateReservationStatus(id, status, tenantId = DEFAULT_TENANT_ID) {
  const query = `
    UPDATE reservations
    SET status = $1
    WHERE id = $2 AND tenant_id = $3
    RETURNING id, status, position
  `;
  const { rows } = await pool.query(query, [status, id, tenantId]);
  if (!rows.length) {
    const error = new Error('Rezervasyon bulunamadı');
    error.status = 404;
    throw error;
  }
  return rows[0];
}

