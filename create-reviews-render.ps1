# Render veritabanına reviews tablosu ekleme scripti
# Kullanım: Bu dosyayı çalıştırmadan önce DATABASE_URL değerini Render'dan alıp aşağıya yapıştırın

# ADIM 1: Render Dashboard'dan DATABASE_URL'i kopyalayın ve aşağıdaki satıra yapıştırın
# Örnek: $env:DATABASE_URL = "postgresql://user:password@host:port/dbname?sslmode=require"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Render Veritabanına Reviews Tablosu Ekleme" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# DATABASE_URL'i buraya yapıştırın (Render Dashboard > PostgreSQL > Connect > External Database URL)
$env:DATABASE_URL = "BURAYA_RENDER_DATABASE_URL_YAPISTIRIN"

if ($env:DATABASE_URL -eq "BURAYA_RENDER_DATABASE_URL_YAPISTIRIN") {
    Write-Host "❌ HATA: DATABASE_URL değerini Render'dan alıp script içindeki değişkene yapıştırmanız gerekiyor!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Nasıl yapılır:" -ForegroundColor Yellow
    Write-Host "1. Render.com'a giriş yapın" -ForegroundColor White
    Write-Host "2. PostgreSQL servisinizi açın" -ForegroundColor White
    Write-Host "3. 'Connect' veya 'Info' sekmesine gidin" -ForegroundColor White
    Write-Host "4. 'External Database URL' veya 'Internal Database URL' değerini kopyalayın" -ForegroundColor White
    Write-Host "5. Bu script dosyasını açın ve 12. satırdaki DATABASE_URL değerini değiştirin" -ForegroundColor White
    exit 1
}

Write-Host "Reviews tablosu oluşturuluyor..." -ForegroundColor Yellow
Write-Host ""

# Script'i çalıştır
node scripts/create-reviews-table.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Başarılı! Reviews tablosu Render veritabanına eklendi." -ForegroundColor Green
    Write-Host "Şimdi Render'daki backend servisinizi yeniden başlatın (Dashboard > Restart)" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Hata oluştu. Lütfen yukarıdaki hata mesajını kontrol edin." -ForegroundColor Red
}

