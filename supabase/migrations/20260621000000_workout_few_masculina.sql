-- Seed workout plan: FEW Masculina (5-day split A–E)
-- Replaces the previous sample plan as the active one.

-- Deactivate any previously active plans for the user.
UPDATE workout_plans
SET is_active = FALSE
WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND id <> 'a27e682f-25bc-4ff6-9612-3b82218f41a3';

INSERT INTO workout_plans (id, user_id, name, description, start_date, is_active)
VALUES (
  'a27e682f-25bc-4ff6-9612-3b82218f41a3',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'FEW Masculina',
  'Split A–E (seg–sex). Progressão 8 semanas — S1: 2x12-15 · S2: 3x8-12 · S3: 3x3-7 · S4: 3x5-9 · S5: 3x12-15 · S6: 4x3-7 · S7-8: 4x5-9. Back Off Set: na última série, reduza 20% da carga, descanse 30s e faça uma série até a falha. (H) = halteres. ABD (Crunch Cross) 3x10 todos os dias. HIIT Bike após o treino.',
  '2026-06-22',
  TRUE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_days (id, workout_plan_id, day_of_week, title, description, workout_type) VALUES
  ('7e892f81-66b6-457c-ab43-19a668d1b40d', 'a27e682f-25bc-4ff6-9612-3b82218f41a3', 1, 'Treino A — Peito', 'Peito · ABD 3x10 + HIIT Bike após o treino', 'strength'),
  ('4c88913a-0a5f-46f6-888a-cfb96473b285', 'a27e682f-25bc-4ff6-9612-3b82218f41a3', 2, 'Treino B — Costas', 'Costas · ABD 3x10 + HIIT Bike após o treino', 'strength'),
  ('b857a90d-a5fc-4968-806e-7c036a9426b6', 'a27e682f-25bc-4ff6-9612-3b82218f41a3', 3, 'Treino C — Ombro', 'Ombro · ABD 3x10 + HIIT Bike após o treino', 'strength'),
  ('13aa9be1-a614-4c77-845c-86700a1316d6', 'a27e682f-25bc-4ff6-9612-3b82218f41a3', 4, 'Treino D — Bíceps e Tríceps', 'Braço · ABD 3x10 + HIIT Bike após o treino', 'strength'),
  ('c9188db1-df2d-4b2f-9dd1-55a546931274', 'a27e682f-25bc-4ff6-9612-3b82218f41a3', 5, 'Treino E — Pernas', 'Pernas · ABD 3x10 + HIIT Bike após o treino', 'strength'),
  ('266fc13c-2296-45b8-89c6-394fa2aefb88', 'a27e682f-25bc-4ff6-9612-3b82218f41a3', 6, 'Descanso', 'Descanso ou cardio leve', 'rest'),
  ('19502314-8819-4c33-af73-288430ca9d2d', 'a27e682f-25bc-4ff6-9612-3b82218f41a3', 0, 'Descanso', 'Descanso ou cardio leve', 'rest')
ON CONFLICT (id) DO NOTHING;

-- Reset exercises for these days so the migration is idempotent.
DELETE FROM workout_exercises WHERE workout_day_id IN (
  '7e892f81-66b6-457c-ab43-19a668d1b40d',
  '4c88913a-0a5f-46f6-888a-cfb96473b285',
  'b857a90d-a5fc-4968-806e-7c036a9426b6',
  '13aa9be1-a614-4c77-845c-86700a1316d6',
  'c9188db1-df2d-4b2f-9dd1-55a546931274'
);

INSERT INTO workout_exercises (workout_day_id, exercise_name, sets, reps, order_index, notes) VALUES
  -- Treino A — Peito
  ('7e892f81-66b6-457c-ab43-19a668d1b40d', 'Crucifixo Reto (H)', 2, 15, 0, 'Pausa Excêntrica 2". Vídeo: https://www.youtube.com/watch?v=NB_1mCfIOLU'),
  ('7e892f81-66b6-457c-ab43-19a668d1b40d', 'Supino Inclinado (H)', 2, 15, 1, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=F4Q1g2z8MWM'),
  ('7e892f81-66b6-457c-ab43-19a668d1b40d', 'Supino Dinâmico (H)', 2, 15, 2, 'Back Off Set na última série. Vídeo: https://www.instagram.com/reel/ByT2e_2Hb1q/'),
  ('7e892f81-66b6-457c-ab43-19a668d1b40d', 'Cross Over', 2, 15, 3, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=o90Pm6qTeNI'),
  -- Treino B — Costas
  ('4c88913a-0a5f-46f6-888a-cfb96473b285', 'Puxada Frente (Abertura Máx)', 2, 15, 0, 'Vídeo: https://www.youtube.com/watch?v=Xn-fIQw08q4'),
  ('4c88913a-0a5f-46f6-888a-cfb96473b285', 'Puxada Frente Triângulo', 2, 15, 1, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=qW3-gblri0g'),
  ('4c88913a-0a5f-46f6-888a-cfb96473b285', 'Remada Curvada Pronada', 2, 15, 2, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=450BATkYXgI'),
  ('4c88913a-0a5f-46f6-888a-cfb96473b285', 'Remada Sentado Aberta', 2, 15, 3, 'Vídeo: https://www.youtube.com/watch?v=IVUC76X7iOI'),
  -- Treino C — Ombro
  ('b857a90d-a5fc-4968-806e-7c036a9426b6', 'Desenvolvimento (H)', 2, 15, 0, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=L-iQfHVeuVg'),
  ('b857a90d-a5fc-4968-806e-7c036a9426b6', 'Elevação Lateral', 2, 15, 1, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=qDAoUOmdbi4'),
  ('b857a90d-a5fc-4968-806e-7c036a9426b6', 'Elevação Frontal (Y) 45º', 2, 15, 2, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=BrjFIOlT8nA'),
  ('b857a90d-a5fc-4968-806e-7c036a9426b6', 'Crucifixo Reverso Cross', 2, 15, 3, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=9vXtSS7LZB4'),
  -- Treino D — Bíceps e Tríceps
  ('13aa9be1-a614-4c77-845c-86700a1316d6', 'Rosca Direta 45º (H)', 2, 15, 0, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=ioML_NZH16M'),
  ('13aa9be1-a614-4c77-845c-86700a1316d6', 'Rosca Martelo Scott (H)', 2, 15, 1, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=xDaBywsDams'),
  ('13aa9be1-a614-4c77-845c-86700a1316d6', 'Tríceps Corda', 2, 15, 2, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=gbnLZto6b0s'),
  ('13aa9be1-a614-4c77-845c-86700a1316d6', 'Tríceps Francês Cross', 2, 15, 3, 'Back Off Set na última série. Vídeo: https://www.youtube.com/shorts/HFOPO_iIJig'),
  -- Treino E — Pernas
  ('c9188db1-df2d-4b2f-9dd1-55a546931274', 'Agachamento Livre', 2, 15, 0, 'Pausa Excêntrica 2". Vídeo: https://www.youtube.com/watch?v=WLw3eRGkM5U'),
  ('c9188db1-df2d-4b2f-9dd1-55a546931274', 'Leg Press', 2, 15, 1, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=9ruGCg0m9Tw'),
  ('c9188db1-df2d-4b2f-9dd1-55a546931274', 'Cadeira Extensora', 2, 15, 2, 'Vídeo: https://www.youtube.com/watch?v=eCbgespEnFo'),
  ('c9188db1-df2d-4b2f-9dd1-55a546931274', 'Cadeira Flexora', 2, 15, 3, 'Back Off Set na última série. Vídeo: https://www.youtube.com/watch?v=-EIXZD5AEuE'),
  ('c9188db1-df2d-4b2f-9dd1-55a546931274', 'Gêmeos Leg Press', 2, 15, 4, 'Vídeo: https://www.youtube.com/watch?v=zusySgJMqCg');
