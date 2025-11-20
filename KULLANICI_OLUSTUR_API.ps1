# API ile Kullanıcı Oluşturma Script'i

Write-Host "=== API ile Kullanıcı Oluşturma ===" -ForegroundColor Cyan
Write-Host "Backend'in http://localhost:4000 adresinde çalıştığından emin ol!" -ForegroundColor Yellow
Write-Host ""

# 1. Öğrenci (Müşteri) Oluştur
Write-Host "1. Öğrenci oluşturuluyor..." -ForegroundColor Yellow
$studentBody = @{
    fullName = "Demo Öğrenci"
    email = "student@example.com"
    password = "student123"
    tenantSlug = "pilot-deneyap"
    role = "student"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $studentBody
    
    Write-Host "✓ Öğrenci oluşturuldu!" -ForegroundColor Green
    Write-Host "  Email: student@example.com" -ForegroundColor White
    Write-Host "  Şifre: student123" -ForegroundColor White
} catch {
    Write-Host "✗ Öğrenci oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Hata: $($errorObj.message)" -ForegroundColor Red
    }
}

Write-Host ""

# 2. Admin Oluştur (İlk admin için token gerekmez, ama ikinci admin için gerekir)
Write-Host "2. Admin oluşturuluyor..." -ForegroundColor Yellow
$adminBody = @{
    fullName = "Admin Kullanıcı"
    email = "admin@example.com"
    password = "admin123"
    tenantSlug = "pilot-deneyap"
    role = "admin"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $adminBody
    
    Write-Host "✓ Admin oluşturuldu!" -ForegroundColor Green
    Write-Host "  Email: admin@example.com" -ForegroundColor White
    Write-Host "  Şifre: admin123" -ForegroundColor White
} catch {
    Write-Host "✗ Admin oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Hata: $($errorObj.message)" -ForegroundColor Red
        Write-Host "  Not: İlk admin için admin token gerekmez, ama hata alırsan create-admin.js script'ini kullan" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Giriş Bilgileri ===" -ForegroundColor Cyan
Write-Host "Tenant Slug: pilot-deneyap" -ForegroundColor White
Write-Host ""
Write-Host "Öğrenci:" -ForegroundColor Green
Write-Host "  Email: student@example.com" -ForegroundColor White
Write-Host "  Şifre: student123" -ForegroundColor White
Write-Host ""
Write-Host "Admin:" -ForegroundColor Green
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Şifre: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Frontend'de bu bilgilerle giriş yapabilirsin!" -ForegroundColor Green

