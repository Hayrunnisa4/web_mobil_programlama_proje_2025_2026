-- İade talebi için schema güncellemesi
-- Loans tablosuna 'pending_return' status'ü ekleniyor

ALTER TABLE loans 
DROP CONSTRAINT IF EXISTS loans_status_check;

ALTER TABLE loans 
ADD CONSTRAINT loans_status_check 
CHECK (status IN ('borrowed', 'returned', 'overdue', 'pending_return'));


