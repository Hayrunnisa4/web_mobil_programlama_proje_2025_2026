import dotenv from 'dotenv';
import pkg from 'pg';

// Proje kökündeki .env dosyasını her yerden (scripts vs.) doğru okumak için:
const envPath = new URL('../../.env', import.meta.url);
dotenv.config({ path: envPath });

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected database error', err);
  process.exit(1);
});

export default pool;

