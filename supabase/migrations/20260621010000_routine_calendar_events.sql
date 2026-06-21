-- Seed Lucas's weekly routine as calendar events.
-- Recurring events use an anchor (start_datetime = first occurrence) plus a
-- weekly rule "weekly:N,..." (N = 0 Sun ... 6 Sat). The app expands them.
-- Times are stored with the -03 (America/Sao_Paulo) offset.

INSERT INTO calendar_events
  (id, user_id, title, description, event_type, start_datetime, end_datetime, status, priority, is_recurring, recurrence_rule)
VALUES
  -- Academia (gym split A–E), seg–sex 07:00–08:00
  ('d44990c7-5bbf-4fbb-a963-677ecde052f8', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Academia · Treino A (Peito)', 'Plano FEW Masculina', 'workout', '2026-06-01 07:00:00-03', '2026-06-01 08:00:00-03', 'planned', 'medium', TRUE, 'weekly:1'),
  ('eb9cbff3-0367-4fc1-a977-c51c31310da2', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Academia · Treino B (Costas)', 'Plano FEW Masculina', 'workout', '2026-06-02 07:00:00-03', '2026-06-02 08:00:00-03', 'planned', 'medium', TRUE, 'weekly:2'),
  ('9da96eac-bfce-436b-8f69-18137f5f79f7', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Academia · Treino C (Ombro)', 'Plano FEW Masculina', 'workout', '2026-06-03 07:00:00-03', '2026-06-03 08:00:00-03', 'planned', 'medium', TRUE, 'weekly:3'),
  ('3915b650-a458-48c7-9df4-0c08c2012e62', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Academia · Treino D (Braço)', 'Plano FEW Masculina', 'workout', '2026-06-04 07:00:00-03', '2026-06-04 08:00:00-03', 'planned', 'medium', TRUE, 'weekly:4'),
  ('adcc44c5-81bd-4c21-98b9-d2e372c7bab1', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Academia · Treino E (Pernas)', 'Plano FEW Masculina', 'workout', '2026-06-05 07:00:00-03', '2026-06-05 08:00:00-03', 'planned', 'medium', TRUE, 'weekly:5'),

  -- Trabalho + Pós Descomplica, seg–sex 09:00–18:00
  ('08d28d52-9ccc-4f64-ba90-c75db0c3960c', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Trabalho + Pós Descomplica', 'Expediente; estudar pós-graduação ao longo do dia', 'routine', '2026-06-01 09:00:00-03', '2026-06-01 18:00:00-03', 'planned', 'low', TRUE, 'weekly:1,2,3,4,5'),

  -- Reuniões
  ('3d2f9695-8fcc-412a-903f-8549c0a213ac', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Reunião · Daily EVT', NULL, 'appointment', '2026-06-01 15:30:00-03', '2026-06-01 16:00:00-03', 'planned', 'medium', TRUE, 'weekly:1,2,3,4,5'),
  ('85816f53-eb7b-449b-b224-f16a8504f0c6', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Reunião · Weekly', NULL, 'appointment', '2026-06-01 14:00:00-03', '2026-06-01 15:00:00-03', 'planned', 'medium', TRUE, 'weekly:1'),
  ('abc44f42-e1c1-4695-a0a9-903a8c054698', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Reunião · Weekly', NULL, 'appointment', '2026-06-01 17:30:00-03', '2026-06-01 18:00:00-03', 'planned', 'medium', TRUE, 'weekly:1'),

  -- Atividades físicas extras
  ('fd3ba7d6-8abb-4ef1-aa73-1d2b31beb1f6', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Muay Thai', NULL, 'workout', '2026-06-02 20:00:00-03', '2026-06-02 21:00:00-03', 'planned', 'medium', TRUE, 'weekly:2,4'),
  ('4dc91f5f-2bce-4271-8229-a02aa89069e6', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bicicleta', NULL, 'workout', '2026-06-01 18:00:00-03', '2026-06-01 19:00:00-03', 'planned', 'low', TRUE, 'weekly:0,1,2,3,4,5,6'),

  -- Evento único: reunião de migração Properway (segunda 22/06/2026)
  ('47cbfc5c-7f32-44e6-a806-79149383cff0', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Reunião · Migração Properway', NULL, 'appointment', '2026-06-22 16:00:00-03', '2026-06-22 17:00:00-03', 'planned', 'high', FALSE, NULL)
ON CONFLICT (id) DO NOTHING;
