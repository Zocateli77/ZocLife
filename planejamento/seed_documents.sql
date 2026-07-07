-- ZocLabs · Documentação do plano 4 semanas -> módulo Documents do ZocLife.
-- Registra as docs educacionais (linkadas ao conteúdo) + as docs de referência do planejamento.
-- Rodar:  node --env-file=.env.local scripts/seed.mjs planejamento/seed_documents.sql
-- Idempotente: remove só os documentos marcados [plano-4sem-2026] antes de reinserir.

BEGIN;

DELETE FROM documents
WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND description LIKE '%[plano-4sem-2026]%';

-- ===== Documentação educacional (linkada ao item de conteúdo) =====

-- V1: doc-resumo / companheira pública (HTML + PDF)
INSERT INTO documents (user_id, title, description, document_type, url, content, related_content_id)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Doc companheira — Power Automate: 3 fluxos (V1)',
  'Documento educacional público do vídeo V1 (estudo + resumo). HTML autocontido + PDF. [plano-4sem-2026]',
  'file',
  'planejamento/docs/power-automate-3-fluxos/index.html',
  'Conceito gatilho/condição/ação, os 3 fluxos (anexos->SharePoint, alerta Teams, lembrete), glossário EN<->PT, perguntas da audiência e reaproveitamento. PDF: planejamento/docs/power-automate-3-fluxos/resumo.pdf',
  (SELECT id FROM content_items WHERE user_id='a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND title='Power Automate do zero: 3 fluxos simples pra parar de fazer trabalho manual' AND content_type='video' LIMIT 1)
);

-- V1: roteiro detalhado de gravação (script)
INSERT INTO documents (user_id, title, description, document_type, url, content, related_content_id)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Roteiro detalhado — V1 Power Automate',
  'Script de gravação do V1: tempos, falas, ações de tela e textos. [plano-4sem-2026]',
  'script',
  'planejamento/roteiros/v1-roteiro-detalhado.md',
  'Blocos 0 a 6 (gancho, contexto, 3 fluxos, recap/erros, CTA) com marcação CAMERA/TELA, on-screen text e notas de pós-produção/reaproveitamento.',
  (SELECT id FROM content_items WHERE user_id='a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND title='Power Automate do zero: 3 fluxos simples pra parar de fazer trabalho manual' AND content_type='video' LIMIT 1)
);

-- C13: doc de estudo
INSERT INTO documents (user_id, title, description, document_type, url, content, related_content_id)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Doc de estudo — C13 O fluxo que todo iniciante deveria criar',
  'Material de estudo/aula do carrossel C13 + legenda educacional pronta pra postar. HTML + PDF. [plano-4sem-2026]',
  'file',
  'planejamento/docs/c13-fluxo-iniciante/index.html',
  'Modelo gatilho/condição/ação, o primeiro fluxo passo a passo, erros comuns, perguntas da audiência, legenda pública e glossário. PDF: planejamento/docs/c13-fluxo-iniciante/resumo.pdf',
  (SELECT id FROM content_items WHERE user_id='a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND title='O fluxo que todo iniciante em Power Automate deveria criar' AND content_type='carousel' LIMIT 1)
);

-- C14: doc de estudo
INSERT INTO documents (user_id, title, description, document_type, url, content, related_content_id)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Doc de estudo — C14 Anexos de e-mail no SharePoint',
  'Material de estudo/aula do carrossel C14 + legenda educacional pronta pra postar. HTML + PDF. [plano-4sem-2026]',
  'file',
  'planejamento/docs/c14-anexos-sharepoint/index.html',
  'Os 4 passos com a ação exata (gatilho, condição, Apply to each, aviso Teams), erros nº1 e nº2, perguntas da audiência, legenda pública e glossário. PDF: planejamento/docs/c14-anexos-sharepoint/resumo.pdf',
  (SELECT id FROM content_items WHERE user_id='a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND title='Salve anexos de e-mail no SharePoint sem codigo' AND content_type='carousel' LIMIT 1)
);

-- ===== Documentação de referência do planejamento (geral) =====

INSERT INTO documents (user_id, title, description, document_type, url, content, related_content_id) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890','Planejamento Editorial ZocLabs — 4 semanas','Documento mestre: estratégia, tendências (com fontes), pilares, reaproveitamento e regra de conteúdo educacional. [plano-4sem-2026]','note','planejamento/PLANEJAMENTO_ZOCLABS.md','Resumo estratégico + diagnóstico de tendências jun/2026 + 5 pilares + sistema de reaproveitamento + regra dos documentos educacionais.',NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890','Banco de carrosséis (30 ideias)','30 ideias de carrossel completas (capa, slides, CTA, tempo, reuso). [plano-4sem-2026]','file','planejamento/banco_carrosseis.md','Pilares Codex, Claude Code, Power Automate, Power Apps e IA+Automação. Níveis iniciante/intermediário/avançado.',NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890','Banco de reels (8 tech + Copa)','8 reels de tech roteirizados + slots da série Copa. [plano-4sem-2026]','file','planejamento/banco_reels.md','Molde Reels 2026 (gancho 3s, texto na tela, CTA), gravação de tela vs câmera, duração.',NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890','Banco de vídeos longos (4)','4 vídeos Mão na Massa (8-10 min) com blocos, roteiro, demo e reaproveitamento. [plano-4sem-2026]','file','planejamento/banco_videos_longos.md','V1 Power Automate, V2 Codex, V3 Claude Code, V4 Power Apps.',NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890','Calendário editorial 4 semanas','Visão dia a dia (22/jun a 19/jul), carga noturna e melhores horários. [plano-4sem-2026]','file','planejamento/calendario_conteudo.md','Rotação por pilar, reels Ter/Qui, Copa Qua/Sex, vídeo gravar sáb/publicar dom.',NULL);

COMMIT;

-- Conferência:
-- SELECT document_type, count(*) FROM documents WHERE description LIKE '%[plano-4sem-2026]%' GROUP BY document_type;
-- Vínculos: SELECT d.title, c.title AS conteudo FROM documents d
--   JOIN content_items c ON c.id = d.related_content_id
--   WHERE d.description LIKE '%[plano-4sem-2026]%';
