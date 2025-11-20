import pool from '../config/database.js';
import { promoteNextReservation } from './reservationService.js';
import logger from '../utils/logger.js';

export async function borrowResource({
  tenantId,
  resourceId,
  userId,
  dueAt,
}) {
  if (!tenantId) {
    const error = new Error('Tenant bilgisi gerekli');
    error.status = 400;
    throw error;
  }
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

    // Kullanıcının bu kaynak için aktif rezervasyonunu fulfilled yap
    const updateResult = await client.query(
      `UPDATE reservations 
       SET status = 'fulfilled' 
       WHERE tenant_id = $1 AND resource_id = $2 AND user_id = $3 
       AND status IN ('waiting', 'notified')`,
      [tenantId, resourceId, userId],
    );
    if (updateResult.rowCount > 0) {
      logger.info(`Rezervasyon fulfilled yapıldı: ${updateResult.rowCount} adet`);
    }

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Öğrenci iade talebi oluşturur
export async function requestReturn(loanId, tenantId, userId) {
  if (!tenantId || !userId) {
    const error = new Error('Tenant ve kullanıcı bilgisi gerekli');
    error.status = 400;
    throw error;
  }
  const query = `
    UPDATE loans
    SET status = 'pending_return'
    WHERE id = $1 AND tenant_id = $2 AND user_id = $3 AND status IN ('borrowed', 'overdue')
    RETURNING id, resource_id AS "resourceId", user_id AS "userId",
              borrowed_at AS "borrowedAt", due_at AS "dueAt", returned_at AS "returnedAt", status
  `;
  const { rows } = await pool.query(query, [loanId, tenantId, userId]);
  if (!rows.length) {
    const error = new Error('Aktif ödünç kaydı bulunamadı veya zaten iade talebi oluşturulmuş');
    error.status = 404;
    throw error;
  }
  return rows[0];
}

// Admin iade talebini onaylar (gerçek iade işlemi)
export async function returnResource(loanId, tenantId, userId = null, userRole = null) {
  if (!tenantId) {
    const error = new Error('Tenant bilgisi gerekli');
    error.status = 400;
    throw error;
  }
  // Admin sadece pending_return olanları onaylayabilir
  const whereClause = userRole === 'admin'
    ? 'id = $1 AND tenant_id = $2 AND status = $3'
    : 'id = $1 AND tenant_id = $2 AND status = $3';
  const queryParams = userRole === 'admin'
    ? [loanId, tenantId, 'pending_return']
    : [loanId, tenantId, 'borrowed'];
  
  const query = `
    UPDATE loans
    SET status = 'returned', returned_at = NOW()
    WHERE ${whereClause}
    RETURNING id, resource_id AS "resourceId", user_id AS "userId",
              borrowed_at AS "borrowedAt", due_at AS "dueAt", returned_at AS "returnedAt", status
  `;
  const { rows } = await pool.query(query, queryParams);
  if (!rows.length) {
    const error = new Error('İade talebi bulunamadı');
    error.status = 404;
    throw error;
  }
  const loan = rows[0];
  const reservation = await promoteNextReservation(loan.resourceId, tenantId);
  if (reservation) {
    logger.info('Rezervasyon kuyruğu güncellendi', {
      reservationId: reservation.id,
      userId: reservation.userId,
      resourceId: reservation.resourceId,
    });
  }
  return loan;
}

export async function listLoans({
  tenantId,
  status,
}) {
  if (!tenantId) {
    const error = new Error('Tenant bilgisi gerekli');
    error.status = 400;
    throw error;
  }
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

export async function listLoansByUser({
  tenantId,
  userId,
  status,
}) {
  if (!tenantId || !userId) {
    const error = new Error('Tenant ve kullanıcı bilgisi gerekli');
    error.status = 400;
    throw error;
  }
  const conditions = ['l.tenant_id = $1', 'l.user_id = $2'];
  const values = [tenantId, userId];
  if (status) {
    conditions.push('l.status = $3');
    values.push(status);
  }
  const query = `
    SELECT l.id, l.status, l.borrowed_at AS "borrowedAt", l.due_at AS "dueAt",
           l.returned_at AS "returnedAt", l.resource_id AS "resourceId",
           r.title AS "resourceTitle",
           rev.rating, rev.comment
    FROM loans l
    JOIN resources r ON r.id = l.resource_id
    LEFT JOIN reviews rev ON rev.loan_id = l.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY l.borrowed_at DESC
  `;
  const { rows } = await pool.query(query, values);
  return rows.map((row) => ({
    ...row,
    review: row.rating ? { rating: row.rating, comment: row.comment } : null,
  }));
}

