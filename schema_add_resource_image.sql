-- Kaynaklara görsel URL'si için yeni kolon
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS image_url TEXT;

