-- 5 carrosséis do banco que não entraram no calendário das 4 semanas -> backlog no ZocLife.
-- Idempotente via marcador [plano-4sem-2026] + [backlog].
BEGIN;
DELETE FROM content_items
WHERE user_id='a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND notes LIKE '%[plano-4sem-2026][backlog]%';

INSERT INTO content_items
  (user_id, title, description, platform, status, content_type, cta, hashtags, planned_date, notes)
VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890','Do zero ao 1º script com Codex em 20 min','Nunca programou? Seu 1º script útil sai em 20 min com o Codex.','instagram','idea','carousel','Salva esse passo a passo de 20 min.',ARRAY['codex','openai','ia','terminal','zoclabs'],NULL,'Pilar: Codex | Backlog (reserva) | Prioridade: media | [plano-4sem-2026][backlog]'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890','Skills: ensine o agente a trabalhar do seu jeito','Cansou de repetir o mesmo prompt? Vira uma Skill e o agente ja sabe.','instagram','idea','carousel','Salva. Tema avancado - quer um tutorial?',ARRAY['claudecode','anthropic','ia','skills','zoclabs'],NULL,'Pilar: Claude Code | Backlog (reserva) | Tema complexo: doc-resumo publico | Prioridade: media | [plano-4sem-2026][backlog]'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890','Aprovacao simples no Power Automate (sem planilha)','Aprovacao por e-mail e planilha? Existe um jeito automatico e rastreavel.','instagram','idea','carousel','Salva. Envia pro gestor que vive aprovando no e-mail.',ARRAY['powerautomate','automacao','lowcode','aprovacao','zoclabs'],NULL,'Pilar: Power Automate | Backlog (reserva) | Prioridade: media | [plano-4sem-2026][backlog]'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890','Power Automate agora tem agentes de IA: o que muda','Power Automate + agentes de IA: seu fluxo agora pensa.','instagram','idea','carousel','Salva. Comenta se quer ver montando.',ARRAY['powerautomate','ia','automacao','agentes','zoclabs'],NULL,'Pilar: Power Automate | Backlog (reserva) | Fonte: wave 1 2026 | Prioridade: media | [plano-4sem-2026][backlog]'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890','Agentes de IA explicados sem enrolacao','Todo mundo fala agente de IA e ninguem explica direito. Vou explicar.','instagram','idea','carousel','Salva. Envia pra quem confunde tudo com ChatGPT.',ARRAY['ia','agentes','automacao','tecnologia','zoclabs'],NULL,'Pilar: IA + Automacao | Backlog (reserva) | Prioridade: media | [plano-4sem-2026][backlog]');
COMMIT;
