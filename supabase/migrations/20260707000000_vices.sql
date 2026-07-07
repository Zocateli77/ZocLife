-- Vices module — track habits to reduce (daily limits)
-- Migration: 20260707000000_vices.sql

CREATE TABLE IF NOT EXISTS vices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  limit_value NUMERIC(10,2) NOT NULL,
  limit_unit TEXT NOT NULL DEFAULT 'minutes',
  color TEXT DEFAULT '#E85002',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER vices_updated_at
  BEFORE UPDATE ON vices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_vices_user_id ON vices(user_id);

CREATE TABLE IF NOT EXISTS vice_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vice_id UUID NOT NULL REFERENCES vices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  value NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vice_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_vice_logs_vice_id ON vice_logs(vice_id);
CREATE INDEX IF NOT EXISTS idx_vice_logs_log_date ON vice_logs(log_date);

ALTER TABLE vices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vice_logs ENABLE ROW LEVEL SECURITY;
