import dotenv from 'dotenv';
import pool from '../src/config/database.js';
import { hashPassword } from '../src/utils/password.js';

const envPath = new URL('../.env', import.meta.url);
dotenv.config({ path: envPath });

const DEFAULT_TENANT_ID =
  process.env.DEFAULT_TENANT_ID || '00000000-0000-0000-0000-000000000001';

async function ensureTenant() {
  const query = `
    INSERT INTO tenants (id, name, slug, contact_email)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO NOTHING
  `;
  await pool.query(query, [
    DEFAULT_TENANT_ID,
    'Pilot Deneyap Atölyesi',
    'pilot-deneyap',
    'pilot@example.com',
  ]);
}

async function seedResources() {
  const resources = [
    {
      title: 'Arduino ile Prototipleme',
      author: 'H. Kasımay',
      topic: 'Elektronik',
      difficulty: 'Beginner',
      totalStock: 5,
      description: 'Deneyap öğrencileri için giriş seviye IoT kitabı.',
    },
    {
      title: '3B Yazıcı Tasarım Rehberi',
      author: 'F. C. Akbaş',
      topic: 'Üretim',
      difficulty: 'Intermediate',
      totalStock: 3,
      description: 'Slicing ayarları ve malzeme seçimleriyle ilgili kapsamlı rehber.',
    },
    {
      title: 'Makine Öğrenmesine Giriş',
      author: 'İ. Yörük',
      topic: 'Yapay Zeka',
      difficulty: 'Advanced',
      totalStock: 2,
      description: 'Projelerle uygulamalı ML anlatımı.',
    },
  ];

  const insertQuery = `
    INSERT INTO resources (
      tenant_id, title, author, topic, difficulty, total_stock, available_stock, description
    )
    VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
  `;

  for (const resource of resources) {
    const existsQuery = `
      SELECT 1 FROM resources WHERE tenant_id = $1 AND LOWER(title) = LOWER($2) LIMIT 1
    `;
    const { rowCount } = await pool.query(existsQuery, [
      DEFAULT_TENANT_ID,
      resource.title,
    ]);
    if (rowCount) {
      continue;
    }
    await pool.query(insertQuery, [
      DEFAULT_TENANT_ID,
      resource.title,
      resource.author,
      resource.topic,
      resource.difficulty,
      resource.totalStock,
      resource.description,
    ]);
  }
}

async function seedStudent() {
  const email = 'student@example.com';
  const existsQuery = `
    SELECT 1 FROM users WHERE tenant_id = $1 AND email = $2 LIMIT 1
  `;
  const { rowCount } = await pool.query(existsQuery, [
    DEFAULT_TENANT_ID,
    email,
  ]);
  if (rowCount) return;

  const passwordHash = await hashPassword('student123');
  const insertQuery = `
    INSERT INTO users (tenant_id, full_name, email, password_hash, role)
    VALUES ($1, $2, $3, $4, 'student')
  `;
  await pool.query(insertQuery, [
    DEFAULT_TENANT_ID,
    'Demo Öğrenci',
    email,
    passwordHash,
  ]);
}

async function main() {
  try {
    await ensureTenant();
    await seedResources();
    await seedStudent();
    console.log('Demo verileri hazır. Giriş bilgileri: student@example.com / student123');
    process.exit(0);
  } catch (err) {
    console.error('Seed işlemi başarısız oldu:', err);
    process.exit(1);
  }
}

main();

