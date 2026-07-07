# Documentos educacionais — ZocLabs

Regra fixa: **todo conteúdo gera um doc de estudo/aula**; vídeos longos e temas complexos geram também um **doc-resumo público**.

## Padrão (doc companheira validada)
- `index.html` **autocontido** (CSS embutido, imagens em base64 ou em `assets/`) — abre sem servidor.
- **PDF** gerado por Edge headless:
  ```bash
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --print-to-pdf="resumo.pdf" "index.html"
  ```
- **Tema claro / print-friendly:** fundo claro, texto Ink `#0E1726`; hero e rodapé escuros (Ink).
- Marca: **Teal `#14B8A6`** nos títulos/realces; **Âmbar `#F59E0B`** em apenas 1 destaque por bloco; fontes Space Grotesk (títulos) / Inter (corpo).
- **Glossário EN↔PT** (a interface Microsoft pode estar em inglês).
- **Screenshots reais anotados** via overlay CSS (`.hl` contorno âmbar; `.redact` tarja sobre e-mail/tenant) — não editar o PNG.
- Rodapé encerra com **"Tecnologia na prática."** (sem "Tô fora!" — esse é bordão falado do vídeo).

## Dois tipos
| Tipo | Quando | Objetivo |
|------|--------|----------|
| **Doc de estudo/aula** (interno) | sempre (toda peça) | Lucas estudar e dar aula: passo a passo + o "porquê" + erros comuns + perguntas da audiência |
| **Conteúdo educacional público** | **sempre também** — o Lucas quer postar educacional toda vez | Carrossel/reel já é didático + legenda‑resumo + link da doc; **vídeo longo/tema complexo** (V1–V4, C9, C12, C23, C24) ganha `resumo.html` completo na descrição/Notion. Captura pro funil ZocTech |

## Estrutura de pastas
```
docs/
  <slug>/
    index.html        # doc de estudo (sempre)
    resumo.html       # doc-resumo público (quando necessário)
    assets/           # screenshots anotados, etc.
```

A coluna `Link de referência` do `calendario_conteudo.csv` (e o `script_url` em `content_items`) apontam para o doc de cada peça.

## Exemplo entregue
- `power-automate-3-fluxos/index.html` — doc de estudo do **V1** (modelo replicável para os próximos).
