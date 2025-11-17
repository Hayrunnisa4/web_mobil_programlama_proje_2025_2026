# Deneyap Kütüphane Backend

Node.js + Express tabanlı bu servis, Deneyap atölyeleri için çok kiracılı (multi-tenant) kütüphane ve kaynak yönetimini sağlar.

## Gereksinimler
- Node.js 18+ (öneri: 20 LTS)
- PostgreSQL 14+
- `DATABASE_URL`, `JWT_SECRET` gibi ortam değişkenleri (`.env.example` dosyasını kopyalayın)

## Kurulum
1. Bağımlılıkları yükleyin
   ```bash
   cd backend
   npm install
   ```
2. Veritabanı şemasını uygulayın
   ```bash
   psql "$env:DATABASE_URL" -f schema.sql
   ```
3. İlk admin kullanıcısını oluşturun
   ```bash
   node scripts/create-admin.js
   ```
4. Geliştirme sunucusunu çalıştırın
   ```bash
   npm run dev
   ```
5. Swagger dokümantasyonunu görmek için tarayıcıda `http://localhost:4000/docs` adresini açın.

## API Özet Tablosu
| Endpoint | Method | Rol | Açıklama |
| --- | --- | --- | --- |
| `/api/auth/register` | POST | opsiyonel (admin token olursa rol seçilir) | Yeni kullanıcı |
| `/api/auth/login` | POST | - | JWT token al |
| `/api/resources` | GET | admin/student | Filtreli kaynak listesi |
| `/api/resources` | POST | admin | Yeni kaynak |
| `/api/loans` | POST | student/admin | Ödünç alma |
| `/api/loans/:id/return` | POST | admin | İade işlemi |
| `/api/reservations` | POST | student/admin | Rezervasyon kuyruğu |
| `/api/reports/overdue` | GET | admin | Süresi geçenler |
| `/api/reports/top-borrowed` | GET | admin | En çok ödünç alınanlar |
| `/docs` | GET | - | Swagger UI dokümantasyonu |

Tüm isteklerde `Authorization: Bearer <token>` başlığı kullanılmalıdır (login hariç).

## Test Kullanım Senaryosu
1. Admin olarak giriş yapın ve katalog oluşturun.
2. Öğrenci hesabıyla giriş yapıp `POST /api/loans` ile kitap alın.
3. Stok sıfırlandığında başka öğrenci için `POST /api/reservations` çağrısı yapın.
4. Admin iade işlemi yaptığında rezervasyon listesinin güncellendiğini doğrulayın.

## Notlar
- Çok kiracılı mantık için `DEFAULT_TENANT_ID` varsayılanı kullanıldı.
- `schema.sql` temel trigger ve fonksiyonları içerir.
- Prod ortamında SSL için `PGSSLMODE=require` ayarlayabilirsiniz.

