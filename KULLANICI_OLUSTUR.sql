-- Önce veritabanını oluştur (eğer yoksa)
-- pgAdmin'de sağ tık -> Create -> Database
-- Database name: deneyap_library

-- Şemayı kur (schema.sql dosyasındaki tüm komutları çalıştır)
-- Sonra bu script'i çalıştır:

-- 1. Tenant'ı oluştur (eğer yoksa)
INSERT INTO tenants (id, name, slug, contact_email)
VALUES ('00000000-0000-0000-0000-000000000001', 'Pilot Deneyap Atölyesi', 'pilot-deneyap', 'pilot@example.com')
ON CONFLICT (id) DO NOTHING;

-- 2. Öğrenci (Müşteri) kullanıcısı oluştur
-- Şifre: student123 (bcrypt hash'i)
INSERT INTO users (tenant_id, full_name, email, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Demo Öğrenci',
    'student@example.com',
    '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Bu hash'i güncelle
    'student'
)
ON CONFLICT (tenant_id, email) DO NOTHING;

-- 3. Admin kullanıcısı oluştur
-- Şifre: admin123 (bcrypt hash'i)
INSERT INTO users (tenant_id, full_name, email, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Admin Kullanıcı',
    'admin@example.com',
    '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Bu hash'i güncelle
    'admin'
)
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Not: Şifre hash'lerini oluşturmak için Node.js script'i kullanmalısın
-- Veya API üzerinden register endpoint'ini kullan

