import readline from 'node:readline';
import dotenv from 'dotenv';
import pool from '../src/config/database.js';
import { hashPassword } from '../src/utils/password.js';

// Bu script "scripts" klasöründen çalıştırıldığı için .env yolunu elle veriyoruz
const envPath = new URL('../.env', import.meta.url);
dotenv.config({ path: envPath });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function main() {
  const fullName = await question('Admin adı soyadı: ');
  const email = await question('Admin email: ');
  const password = await question('Admin şifresi: ');
  const tenantId = process.env.DEFAULT_TENANT_ID;

  rl.close();

  const passwordHash = await hashPassword(password);
  const query = `
    INSERT INTO users (tenant_id, full_name, email, password_hash, role)
    VALUES ($1, $2, $3, $4, 'admin')
    ON CONFLICT (tenant_id, email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id, full_name, email, role
  `;
  const { rows } = await pool.query(query, [tenantId, fullName, email.toLowerCase(), passwordHash]);
  console.log('Admin hazır:', rows[0]);
  process.exit(0);
}

main().catch((err) => {
  console.error('Admin oluşturulamadı', err);
  process.exit(1);
});

