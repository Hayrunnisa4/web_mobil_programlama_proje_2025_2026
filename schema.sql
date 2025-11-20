-- PostgreSQL şeması: Deneyap Kütüphane Yönetim Sistemi

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    topic TEXT,
    difficulty TEXT,
    total_stock INTEGER NOT NULL DEFAULT 1 CHECK (total_stock >= 0),
    available_stock INTEGER NOT NULL DEFAULT 1 CHECK (available_stock >= 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('borrowed', 'returned', 'overdue', 'pending_return'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_loans_unique_active
ON loans(resource_id, user_id)
WHERE status = 'borrowed';

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('waiting', 'notified', 'fulfilled', 'cancelled')),
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_overdue_status()
RETURNS void AS $$
    UPDATE loans
    SET status = 'overdue'
    WHERE status = 'borrowed'
      AND due_at < NOW();
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION adjust_available_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE resources SET available_stock = GREATEST(available_stock - 1, 0)
        WHERE id = NEW.resource_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'returned' AND OLD.status <> 'returned' THEN
        UPDATE resources SET available_stock = available_stock + 1
        WHERE id = NEW.resource_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_adjust_available_stock ON loans;
CREATE TRIGGER trg_adjust_available_stock
AFTER INSERT OR UPDATE ON loans
FOR EACH ROW EXECUTE FUNCTION adjust_available_stock();

INSERT INTO tenants (id, name, slug, contact_email)
VALUES ('00000000-0000-0000-0000-000000000001', 'Pilot Deneyap Atölyesi', 'pilot-deneyap', 'pilot@example.com')
ON CONFLICT (id) DO NOTHING;

