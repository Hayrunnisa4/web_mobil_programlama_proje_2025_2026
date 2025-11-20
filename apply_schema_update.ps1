# PostgreSQL şema güncellemesi
# İade talebi için pending_return status'ü ekleniyor

$env:PGPASSWORD = "123456"  # PostgreSQL şifreni buraya yaz
psql -U postgres -d deneyap -f schema_update_return_request.sql

