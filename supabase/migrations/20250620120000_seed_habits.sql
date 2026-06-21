-- Seed default habits (Phase 4)
INSERT INTO habits (id, user_id, name, description, frequency, target_value, target_unit, color)
VALUES
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Bicicleta',
    'Pedalar 30 minutos todos os dias',
    'daily',
    30,
    'minutes',
    '#14B8A6'
  ),
  (
    'd4e5f6a7-b8c9-0123-def0-234567890123',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Leitura',
    'Ler capítulos do livro do dia',
    'daily',
    3,
    'chapters',
    '#3B82F6'
  ),
  (
    'e5f6a7b8-c9d0-1234-ef01-345678901234',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Beber água',
    'Manter hidratação ao longo do dia',
    'daily',
    2,
    'liters',
    '#10B981'
  )
ON CONFLICT (id) DO NOTHING;
