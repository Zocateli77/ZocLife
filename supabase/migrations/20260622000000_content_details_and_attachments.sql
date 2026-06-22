-- Content production details: "tool used" field + file attachments.

-- 1. Ferramenta utilizada
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS tool TEXT;

-- 2. Attachments table (files live in Supabase Storage; this row is metadata)
CREATE TABLE IF NOT EXISTS content_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_attachments_content_id
  ON content_attachments(content_item_id);

-- Default-deny RLS: only the service role (server) touches this table.
ALTER TABLE content_attachments ENABLE ROW LEVEL SECURITY;

-- 3. Private storage bucket for the attachment files.
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-attachments', 'content-attachments', false)
ON CONFLICT (id) DO NOTHING;
