-- HTML servido pelo Storage vira text/plain (não renderiza). Aponta os links de doc
-- que tinham /index.html para o /resumo.pdf (mesmo conteúdo, renderiza no navegador).
UPDATE documents
SET url = replace(url, '/index.html', '/resumo.pdf')
WHERE description LIKE '%[plano-4sem-2026]%'
  AND url LIKE 'http%' AND url LIKE '%/index.html';

UPDATE content_items
SET script_url = replace(script_url, '/index.html', '/resumo.pdf')
WHERE notes LIKE '%[plano-4sem-2026]%'
  AND script_url LIKE 'http%' AND script_url LIKE '%/index.html';
