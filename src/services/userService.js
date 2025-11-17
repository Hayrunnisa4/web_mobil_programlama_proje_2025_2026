import pool from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

export async function registerUser({
  fullName,
  email,
  password,
  role = 'student',
  tenantId = DEFAULT_TENANT_ID,
}) {
  const client = await pool.connect();
  try {
    const passwordHash = await hashPassword(password);
    const insertQuery = `
      INSERT INTO users (tenant_id, full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, tenant_id AS "tenantId", full_name AS "fullName", email, role, created_at AS "createdAt"
    `;
    const { rows } = await client.query(insertQuery, [
      tenantId,
      fullName,
      email.toLowerCase(),
      passwordHash,
      role,
    ]);
    return rows[0];
  } catch (err) {
    if (err.code === '23505') {
      const error = new Error('Bu email adresi zaten kayıtlı');
      error.status = 400;
      throw error;
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function authenticateUser({ email, password, tenantId = DEFAULT_TENANT_ID }) {
  const query = `
    SELECT id, tenant_id AS "tenantId", full_name AS "fullName", email, password_hash AS "passwordHash", role
    FROM users
    WHERE email = $1 AND tenant_id = $2
  `;
  const { rows } = await pool.query(query, [email.toLowerCase(), tenantId]);

  if (!rows.length) {
    const error = new Error('Email veya şifre hatalı');
    error.status = 401;
    throw error;
  }

  const user = rows[0];
  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Email veya şifre hatalı');
    error.status = 401;
    throw error;
  }
  delete user.passwordHash;
  return user;
}

export async function getUsersByTenant(tenantId = DEFAULT_TENANT_ID) {
  const query = `
    SELECT id, tenant_id AS "tenantId", full_name AS "fullName", email, role, created_at AS "createdAt"
    FROM users
    WHERE tenant_id = $1
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [tenantId]);
  return rows;
}

