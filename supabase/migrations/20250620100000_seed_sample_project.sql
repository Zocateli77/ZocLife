-- Seed sample project for task linking (Phase 2)
INSERT INTO projects (id, user_id, name, description, status, priority, category)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Zoc Life App',
  'Desenvolvimento do aplicativo pessoal Zoc Life',
  'active',
  'high',
  'personal'
) ON CONFLICT (id) DO NOTHING;
