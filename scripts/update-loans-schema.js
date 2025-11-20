import pool from '../src/config/database.js';

async function updateSchema() {
  const client = await pool.connect();
  try {
    console.log('Şema güncelleniyor...');
    
    // Mevcut constraint'i kaldır
    await client.query(`
      ALTER TABLE loans 
      DROP CONSTRAINT IF EXISTS loans_status_check;
    `);
    
    // Yeni constraint ekle (pending_return dahil)
    await client.query(`
      ALTER TABLE loans 
      ADD CONSTRAINT loans_status_check 
      CHECK (status IN ('borrowed', 'returned', 'overdue', 'pending_return'));
    `);
    
    console.log('✅ Şema başarıyla güncellendi!');
    console.log('Artık pending_return status\'ü kullanılabilir.');
  } catch (error) {
    console.error('❌ Hata:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateSchema().catch((err) => {
  console.error(err);
  process.exit(1);
});


