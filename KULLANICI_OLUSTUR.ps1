# PowerShell Script - Kullanıcı Oluşturma

Write-Host "=== Kullanıcı Oluşturma ===" -ForegroundColor Cyan

# Öğrenci oluştur
Write-Host "`n1. Öğrenci oluşturuluyor..." -ForegroundColor Yellow
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
    Write-Host "  Tenant: pilot-deneyap" -ForegroundColor White
} catch {
    Write-Host "✗ Hata: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Detay: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Giriş Bilgileri ===" -ForegroundColor Cyan
Write-Host "Tenant Slug: pilot-deneyap" -ForegroundColor White
Write-Host "Email: student@example.com" -ForegroundColor White
Write-Host "Şifre: student123" -ForegroundColor White
Write-Host "`nFrontend'de bu bilgilerle giriş yapabilirsin!" -ForegroundColor Green

