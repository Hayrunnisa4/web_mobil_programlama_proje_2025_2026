-- Yorum ve puanlama tablosu
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(loan_id) -- Her ödünç için sadece bir yorum
);

CREATE INDEX IF NOT EXISTS idx_reviews_resource ON reviews(resource_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
