# Deneyap Kütüphane Backend

Node.js + Express tabanlı bu servis, Deneyap atölyeleri için çok kiracılı (multi-tenant) kütüphane ve kaynak yönetimini sağlar.

## Gereksinimler
- Node.js 18+ (öneri: 20 LTS)
- PostgreSQL 14+
- Ortam değişkenleri için `.env` dosyası (şablon: `.env.example`)

## Kurulum
1. Bağımlılıkları yükleyin
   ```bash
   cd backend
   npm install
   ```
2. Ortam değişkenlerini hazırlayın
   ```bash
   cp .env.example .env      # PowerShell: copy .env.example .env
   ```
   `DATABASE_URL`, `JWT_SECRET`, `DEFAULT_TENANT_ID` gibi değerleri güncelleyin.
3. Veritabanı şemasını uygulayın
   ```bash
   psql "$env:DATABASE_URL" -f schema.sql
   ```
4. (Opsiyonel) Demo verileri ekleyin
   ```bash
   npm run seed
   ```
   Script, varsayılan tenantı, örnek kaynakları ve `student@example.com / student123` öğrencisini oluşturur.
5. İlk admin kullanıcısını oluşturun
   ```bash
   node scripts/create-admin.js
   ```
6. Geliştirme sunucusunu çalıştırın
   ```bash
   npm run dev
   ```
7. Swagger dokümantasyonunu görmek için tarayıcıda `http://localhost:4000/docs` adresini açın.

## API Özet Tablosu
| Endpoint | Method | Rol | Açıklama |
| --- | --- | --- | --- |
| `/api/auth/register` | POST | opsiyonel (admin token olursa rol seçilir) | Yeni kullanıcı |
| `/api/auth/login` | POST | - | JWT token al |
| `/api/resources` | GET | admin/student | Filtreli kaynak listesi |
| `/api/resources` | POST | admin | Yeni kaynak |
| `/api/loans` | POST | student/admin | Ödünç alma |
| `/api/loans/me` | GET | student/admin | Kullanıcının kendi ödünçleri |
| `/api/loans/:id/return` | POST | admin | İade işlemi |
| `/api/reservations` | POST | student/admin | Rezervasyon kuyruğu |
| `/api/reservations/me` | GET | student/admin | Kullanıcının rezervasyonları |
| `/api/reports/overdue` | GET | admin | Süresi geçenler |
| `/api/reports/top-borrowed` | GET | admin | En çok ödünç alınanlar |
| `/api/tenants` | GET/POST | admin | Tenant listele / oluştur |
| `/api/tenants/:id` | PUT/DELETE | admin | Tenant güncelle / sil |
| `/docs` | GET | - | Swagger UI dokümantasyonu |

Tüm isteklerde `Authorization: Bearer <token>` başlığı kullanılmalıdır (login hariç).

### Tenant bazlı kimlik doğrulama
- Login isteğinde `tenantSlug` (veya `tenantId`) alanlarından biri zorunludur.
- Admin kullanıcıları yeni tenant tanımlamak için `/api/tenants` uçlarını kullanabilir.
- Öğrenci kaydı yapılırken `tenantSlug` gönderilebilir; adminler token kullanarak kendi tenant’larında kullanıcı açabilir.

### Kaynak filtreleri
- `GET /api/resources` sorgusunda aşağıdaki parametreleri kullanabilirsiniz:
  - `q`: Başlık, yazar veya konuya göre genel arama.
  - `availableOnly=true`: Stokta olmayan kaynakları gizler.
  - `sortBy=title|availability|topic`: Liste sıralamasını değiştirir (varsayılan: son eklenen).

## Test Kullanım Senaryosu
1. Admin olarak giriş yapın ve katalog oluşturun.
2. Öğrenci hesabıyla giriş yapıp `POST /api/loans` ile kitap alın.
3. Stok sıfırlandığında başka öğrenci için `POST /api/reservations` çağrısı yapın.
4. Admin iade işlemi yaptığında rezervasyon listesinin güncellendiğini doğrulayın.

## Notlar
- Çok kiracılı mantık için `DEFAULT_TENANT_ID` varsayılanı kullanıldı.
- `schema.sql` temel trigger ve fonksiyonları içerir.
- Prod ortamında SSL için `PGSSLMODE=require` ayarlayabilirsiniz.
- Süresi geçen ödünçler `node-cron` ile saatlik tetiklenen `update_overdue_status()` fonksiyonu sayesinde otomatik güncellenir. `OVERDUE_CRON_SCHEDULE`, `CRON_TIMEZONE`, `RUN_OVERDUE_ON_BOOT` ortam değişkenleriyle planlamayı özelleştirebilirsiniz.

