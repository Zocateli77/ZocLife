-- Seed workout plan (Phase 5)
INSERT INTO workout_plans (id, user_id, name, description, is_active)
VALUES (
  'f6a7b8c9-d0e1-2345-f012-456789012345',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Plano Semanal Lucas',
  'Rotina de treinos da semana',
  TRUE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_days (id, workout_plan_id, day_of_week, title, description, workout_type) VALUES
  ('a7b8c9d0-e1f2-3456-0123-567890123456', 'f6a7b8c9-d0e1-2345-f012-456789012345', 1, 'Treino A', 'Peito e tríceps', 'strength'),
  ('b8c9d0e1-f2a3-4567-1234-678901234567', 'f6a7b8c9-d0e1-2345-f012-456789012345', 2, 'Bicicleta + Muay Thai', 'Cardio e artes marciais', 'cardio'),
  ('c9d0e1f2-a3b4-5678-2345-789012345678', 'f6a7b8c9-d0e1-2345-f012-456789012345', 3, 'Treino B', 'Costas e bíceps', 'strength'),
  ('d0e1f2a3-b4c5-6789-3456-890123456789', 'f6a7b8c9-d0e1-2345-f012-456789012345', 4, 'Bicicleta', '30 minutos', 'cardio'),
  ('e1f2a3b4-c5d6-7890-4567-901234567890', 'f6a7b8c9-d0e1-2345-f012-456789012345', 5, 'Futebol', 'Pelada', 'sport'),
  ('f2a3b4c5-d6e7-8901-5678-012345678901', 'f6a7b8c9-d0e1-2345-f012-456789012345', 6, 'Cardio', 'Corrida ou bike', 'cardio'),
  ('a3b4c5d6-e7f8-9012-6789-123456789012', 'f6a7b8c9-d0e1-2345-f012-456789012345', 0, 'Descanso ativo', 'Caminhada leve', 'active_rest')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_exercises (workout_day_id, exercise_name, sets, reps, weight, order_index) VALUES
  ('a7b8c9d0-e1f2-3456-0123-567890123456', 'Supino reto', 4, 10, 60, 0),
  ('a7b8c9d0-e1f2-3456-0123-567890123456', 'Crucifixo', 3, 12, 14, 1),
  ('a7b8c9d0-e1f2-3456-0123-567890123456', 'Tríceps pulley', 3, 15, 25, 2),
  ('c9d0e1f2-a3b4-5678-2345-789012345678', 'Puxada frontal', 4, 10, 50, 0),
  ('c9d0e1f2-a3b4-5678-2345-789012345678', 'Remada curvada', 3, 10, 40, 1),
  ('c9d0e1f2-a3b4-5678-2345-789012345678', 'Rosca direta', 3, 12, 12, 2);
