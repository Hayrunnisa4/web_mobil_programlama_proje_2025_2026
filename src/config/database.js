import dotenv from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

// Load .env from project root
const envPath = new URL('../../.env', import.meta.url);
dotenv.config({ path: envPath });

// Determine if SSL should be enabled
const enableSSL =
  process.env.NODE_ENV === 'production' ||
  process.env.PGSSLMODE === 'require' ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: enableSSL
    ? {
        require: true,
        rejectUnauthorized: false,
      }
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected database error', err);
  process.exit(1);
});

export default pool;
