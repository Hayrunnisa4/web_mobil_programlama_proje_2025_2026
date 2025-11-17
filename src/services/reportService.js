import pool from '../config/database.js';

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

export async function getOverdueLoans(tenantId = DEFAULT_TENANT_ID) {
  const query = `
    SELECT l.id, l.due_at AS "dueAt", r.title AS "resourceTitle",
           u.full_name AS "userName", u.email AS "userEmail",
           EXTRACT(DAY FROM (NOW() - l.due_at))::INT AS "daysOverdue"
    FROM loans l
    JOIN resources r ON r.id = l.resource_id
    JOIN users u ON u.id = l.user_id
    WHERE l.tenant_id = $1
      AND l.status = 'overdue'
    ORDER BY l.due_at ASC
  `;
  const { rows } = await pool.query(query, [tenantId]);
  return rows;
}

export async function getTopBorrowedResources(tenantId = DEFAULT_TENANT_ID) {
  const query = `
    SELECT r.title, r.topic, COUNT(*)::INT AS "borrowCount"
    FROM loans l
    JOIN resources r ON r.id = l.resource_id
    WHERE l.tenant_id = $1
    GROUP BY r.id
    ORDER BY COUNT(*) DESC
    LIMIT 5
  `;
  const { rows } = await pool.query(query, [tenantId]);
  return rows;
}

