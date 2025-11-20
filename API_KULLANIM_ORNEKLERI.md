# API Kullanım Örnekleri - Kullanıcı Oluşturma

## 1. Swagger UI ile Test (En Kolay)

1. Backend'i başlat: `npm run dev`
2. Tarayıcıda aç: `http://localhost:4000/docs`
3. `/api/auth/register` endpoint'ini bul
4. "Try it out" butonuna tıkla
5. Request body'yi doldur ve "Execute" bas

---

## 2. Öğrenci (Student) Oluşturma

### cURL ile:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "password": "123456",
    "tenantSlug": "pilot-deneyap",
    "role": "student"
  }'
```

### Postman ile:
- **Method:** POST
- **URL:** `http://localhost:4000/api/auth/register`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "fullName": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "password": "123456",
  "tenantSlug": "pilot-deneyap",
  "role": "student"
}
```

### JavaScript (fetch) ile:
```javascript
fetch('http://localhost:4000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullName: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    password: '123456',
    tenantSlug: 'pilot-deneyap',
    role: 'student'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 3. Admin Oluşturma (Admin Token Gerekli)

Önce bir admin hesabı ile giriş yapıp token alman gerekiyor:

### Adım 1: Admin ile Giriş Yap
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "tenantSlug": "pilot-deneyap"
  }'
```

**Response'dan token'ı kopyala:**
```json
{
  "status": "success",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Adım 2: Token ile Yeni Admin Oluştur
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "fullName": "Yeni Admin",
    "email": "admin2@example.com",
    "password": "123456",
    "tenantSlug": "pilot-deneyap",
    "role": "admin"
  }'
```

### Postman ile:
- **Method:** POST
- **URL:** `http://localhost:4000/api/auth/register`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <TOKEN_BURAYA>`
- **Body (raw JSON):**
```json
{
  "fullName": "Yeni Admin",
  "email": "admin2@example.com",
  "password": "123456",
  "tenantSlug": "pilot-deneyap",
  "role": "admin"
}
```

---

## 4. Swagger UI'da Token Ekleme

1. Swagger UI'da sağ üstteki **"Authorize"** butonuna tıkla
2. `bearerAuth` alanına token'ını yapıştır (Bearer yazmadan, sadece token)
3. "Authorize" butonuna bas
4. Artık admin endpoint'lerini test edebilirsin

---

## 5. Başarılı Response Örneği

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenantId": "00000000-0000-0000-0000-000000000001",
    "fullName": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "role": "student",
    "createdAt": "2025-01-XX..."
  }
}
```

---

## 6. Hata Örnekleri

### Admin oluşturmak için token yok:
```json
{
  "status": "error",
  "message": "Admin kullanıcı oluşturmak için admin yetkisi gereklidir"
}
```

### Email zaten kayıtlı:
```json
{
  "status": "error",
  "message": "Bu email adresi zaten kayıtlı"
}
```

### Geçersiz tenant slug:
```json
{
  "status": "error",
  "errors": [
    {
      "msg": "tenantSlug küçük harf, sayı ve tire içermelidir"
    }
  ]
}
```

---

## Hızlı Test Komutları

### Öğrenci oluştur:
```bash
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -d "{\"fullName\":\"Test Öğrenci\",\"email\":\"test@example.com\",\"password\":\"123456\",\"tenantSlug\":\"pilot-deneyap\",\"role\":\"student\"}"
```

### Admin oluştur (önce token al):
```bash
# 1. Token al
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\",\"tenantSlug\":\"pilot-deneyap\"}" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Admin oluştur
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"fullName\":\"Yeni Admin\",\"email\":\"admin2@example.com\",\"password\":\"123456\",\"tenantSlug\":\"pilot-deneyap\",\"role\":\"admin\"}"
```

