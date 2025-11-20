import pool from '../config/database.js';

export async function createReview({ tenantId, resourceId, userId, loanId, rating, comment }) {
  if (!tenantId || !resourceId || !userId || !loanId) {
    const error = new Error('Gerekli bilgiler eksik');
    error.status = 400;
    throw error;
  }
  if (!rating || rating < 1 || rating > 5) {
    const error = new Error('Puan 1-5 arasında olmalıdır');
    error.status = 400;
    throw error;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Ödünç kaydının iade edilmiş olduğunu kontrol et
    const loanCheck = await client.query(
      `SELECT id, status FROM loans WHERE id = $1 AND tenant_id = $2 AND user_id = $3`,
      [loanId, tenantId, userId],
    );
    if (!loanCheck.rows.length || loanCheck.rows[0].status !== 'returned') {
      const error = new Error('Sadece iade edilmiş kitaplar için yorum yapabilirsiniz');
      error.status = 400;
      throw error;
    }
    // Daha önce yorum yapılmış mı kontrol et
    const existingReview = await client.query(
      `SELECT id FROM reviews WHERE loan_id = $1`,
      [loanId],
    );
    if (existingReview.rows.length) {
      const error = new Error('Bu ödünç için zaten yorum yapılmış');
      error.status = 400;
      throw error;
    }
    const query = `
      INSERT INTO reviews (tenant_id, resource_id, user_id, loan_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, resource_id AS "resourceId", user_id AS "userId", loan_id AS "loanId",
                rating, comment, created_at AS "createdAt"
    `;
    const { rows } = await client.query(query, [
      tenantId,
      resourceId,
      userId,
      loanId,
      rating,
      comment || null,
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

export async function getReviewsByResource({ tenantId, resourceId }) {
  if (!tenantId || !resourceId) {
    const error = new Error('Tenant ve kaynak bilgisi gerekli');
    error.status = 400;
    throw error;
  }
  const query = `
    SELECT r.id, r.rating, r.comment, r.created_at AS "createdAt",
           u.full_name AS "userName"
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.tenant_id = $1 AND r.resource_id = $2
    ORDER BY r.created_at DESC
  `;
  const { rows } = await pool.query(query, [tenantId, resourceId]);
  return rows;
}

export async function getReviewByLoan({ tenantId, loanId }) {
  if (!tenantId || !loanId) {
    const error = new Error('Tenant ve ödünç bilgisi gerekli');
    error.status = 400;
    throw error;
  }
  const query = `
    SELECT id, rating, comment, created_at AS "createdAt"
    FROM reviews
    WHERE tenant_id = $1 AND loan_id = $2
  `;
  const { rows } = await pool.query(query, [tenantId, loanId]);
  return rows[0] || null;
}
