# .env dosyasını güncelleme script'i
# Kullanım: .\ENV_GUNCELLE.ps1 -Password "senin_sifren"

param(
    [Parameter(Mandatory=$true)]
    [string]$Password
)

$envFile = ".env"
$newLine = "DATABASE_URL=postgresql://postgres:$Password@localhost:5432/deneyap_library"

# Mevcut .env dosyasını oku
$content = Get-Content $envFile -Raw

# DATABASE_URL satırını değiştir
$content = $content -replace "DATABASE_URL=.*", $newLine

# Dosyayı kaydet
$content | Set-Content $envFile -Encoding UTF8

Write-Host ".env dosyası güncellendi!" -ForegroundColor Green
Write-Host "DATABASE_URL: postgresql://postgres:***@localhost:5432/deneyap_library" -ForegroundColor Cyan

