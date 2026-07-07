# Planejamento Editorial ZocLabs — 4 Semanas (22/jun → 19/jul 2026)

> Estrategista de conteúdo: tecnologia na prática, direto ao ponto.
> Princípio de craft (skill `instagram-unskip`): **skip‑rate ↓ + share‑rate ↑** primeiro. Capa/3s carregam ~80% do alcance. Toda peça tem 1 linha compartilhável e 1 CTA amarrado a uma métrica (salvar/enviar).

---

## 1. Resumo estratégico

ZocLabs é "tecnologia na prática" para o **jovem profissional preso no Excel** que quer usar IA, automação e Power Platform no trabalho real. O plano abaixo é **realista para quem só produz à noite** e já mantém duas rotinas: **1 carrossel por dia** e a **série diária da Copa (Inteligência Artilheira)** até 19/jul.

Três formatos, três funções:
- **Carrossel** = frequência e salvamento (formato principal, 1/dia).
- **Reels** = alcance (2 novos de tech/semana + 2 shorts da Copa, que já existem).
- **Vídeo longo (8–10 min)** = autoridade (1/semana, "Mão na Massa").

Tudo conecta ao **ZocLife** (este app): cada peça vira um registro em `content_items` (ver `seed_content_items.sql`), e cada vídeo/tema complexo gera **documento educacional** (estudo + resumo público).

Meta das 4 semanas: provar consistência (25 carrosséis novos de tech + 8 reels de tech + 8 shorts da Copa + 4 vídeos = 45 peças no ZocLife), abrir 4 "pilares" de autoridade (Codex, Claude Code, Power Automate, Power Apps) e criar o sistema de reaproveitamento que reduz o trabalho à noite. (Sábado é dia de gravar o vídeo; o carrossel diário do sábado fica com a sua série da Copa.)

---

## 2. Tendências pesquisadas (fonte + data)

| Tendência | Fonte (data) | Por que está em alta | Vira conteúdo | Formato |
|-----------|--------------|----------------------|---------------|---------|
| **GPT‑5.3‑Codex + Computer Use no Windows** (Codex opera apps do Windows; 1000+ tool calls autônomos) | [openai.com/codex](https://openai.com/codex/) · [GPT‑5.3‑Codex](https://openai.com/index/introducing-gpt-5-3-codex/) · [Guia 2026](https://tosea.ai/blog/openai-codex-complete-guide-2026) | Codex virou agente que opera o PC — novidade visual e forte | "Codex no Windows: agora ele clica sozinho" | Reel + carrossel |
| **Codex vs Claude Code (2026)** | [MindStudio](https://www.mindstudio.ai/blog/codex-vs-claude-code-2026) | É a dúvida nº1 de quem vai começar agora | Carrossel comparativo → vídeo | Carrossel/vídeo |
| **Claude Code: subagents + skills (Dynamic Workflows, jun/2026)** — "Skill ensina, Hook obriga, Subagent isola" | [Anthropic](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more) · [Releasebot jun/2026](https://releasebot.io/updates/anthropic/claude-code) · [MarkTechPost 14/jun/2026](https://www.marktechpost.com/2026/06/14/claude-code-guide-2026-25-features-with-examples-demo/) | Recurso novo, "avançado mas explicável" | "Subagents em 20s" + carrossel | Reel + carrossel |
| **Power Platform 2026 wave 1: agentes de IA + MCP Server + self‑healing** | [Power Automate wave 1](https://learn.microsoft.com/en-us/power-platform/release-plan/2026wave1/power-automate/) · [Copilot Studio abr/2026](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/new-and-improved-agent-governance-intelligent-workflows-and-connected-app-experiences/) | Microsoft empurrando "AI‑first" no low‑code; público corporativo BR | "Power Automate agora tem agentes" / "fluxos que se consertam sozinhos" | Carrossel + reel |
| **Power Apps via IA conversacional (Canvas Apps MCP Authoring)** — montar app em linguagem natural com Claude Code/Copilot (GA mai/2026) | [Power Platform blog 15/abr/2026](https://www.microsoft.com/en-us/power-platform/blog/2026/04/15/making-business-apps-smarter-with-ai-copilot-and-agents-in-power-apps/) · [Redmondmag abr/2026](https://redmondmag.com/blogs/redmond-dispatch/2026/04/microsoft-expands-copilot-and-ai-agent.aspx) | Junta os 2 mundos do canal (IA agêntica + Power Platform) | "Construa um Power App CONVERSANDO com IA" | Vídeo + carrossel |
| **Reels 2026: estrutura > produção** — how‑to / myth‑busting / "things I wish I knew" lideram saves+shares; 7–15s ganchos, 15–30s tips, 30–60s tutoriais; 1ª hora pós‑post decisiva | [invideo](https://invideo.io/blog/instagram-reels-guide/) · [creatorflow](https://creatorflow.so/blog/instagram-algorithm-2026/) | Confirma que solo‑creator à noite performa sem edição pesada | Define o molde de TODO reel | (meta) |

**Regra anti‑genérico:** nenhuma ideia entra sem mini‑projeto ou situação real de trabalho.

---

## 3. Pilares de conteúdo

1. **Codex na prática** — GPT‑5.3‑Codex, terminal, Windows Computer Use.
2. **Claude Code na prática** — vs Claude comum, contexto/arquitetura, subagents, skills.
3. **Power Automate** — automação sem código (anexos, Teams, aprovações, lembretes, antes/depois).
4. **Power Apps** — apps pequenos e úteis (anexos→SharePoint, solicitação, checklist, app via IA).
5. **IA + Automação (glue)** — agentes explicados, low‑code x código, "o que eu faria começando hoje", erros comuns, meu setup.
6. **Inteligência Artilheira / Copa** — série de alcance (Reels diários já em produção).

---

## 4–6. Bancos de ideias

- **Carrosséis (30):** ver [`banco_carrosseis.md`](banco_carrosseis.md)
- **Reels (8 + Copa):** ver [`banco_reels.md`](banco_reels.md)
- **Vídeos longos (4):** ver [`banco_videos_longos.md`](banco_videos_longos.md)

## 7. Calendário editorial

- Visão legível: [`calendario_conteudo.md`](calendario_conteudo.md)
- Registros ZocLife (rodar no app): [`seed_content_items.sql`](seed_content_items.sql)
- Backup portátil: [`calendario_conteudo.csv`](calendario_conteudo.csv)

---

## 8. Sistema de reaproveitamento (1 vídeo longo → cascata)

Cada vídeo longo (8–10 min) vira:

| Saída | Quantidade | Como |
|-------|-----------|------|
| Carrosséis | 2–3 | 1 por bloco/fluxo do vídeo (o passo a passo já roteirizado) |
| Reels | 3–5 | cada demo/insight do vídeo vira 1 short (15–30s) |
| Post LinkedIn | 1 | a tese + 3 bullets + 1 print (tom executivo) |
| Roteiro TikTok | 1 | o gancho mais forte em 15s, vertical |
| Newsletter/e‑mail | 1 | resumo + link da doc companheira (captura p/ funil ZocTech) |

**Exemplo mapeado — V1 (Power Automate):**
- Carrosséis: #13 (o fluxo que todo iniciante deveria criar) + #14 (anexos→SharePoint) + #15 (alerta Teams).
- Reels: R2 (fluxo que economiza 2h) + R6 (alerta Teams).
- LinkedIn: "3 fluxos que devolvem horas por semana".
- TikTok: gancho do fluxo de anexos ("seu e‑mail vira pasta sozinho").
- Newsletter: "Baixe a doc em português do fluxo de anexos".

O mesmo molde se aplica a V2 (Codex), V3 (Claude Code) e V4 (Power Apps).

---

## 9. Documentos educacionais (regra fixa)

Para **todo conteúdo** sai material educacional (padrão doc companheira: HTML autocontido + PDF via Edge, tema claro, marca ZocLabs, glossário EN↔PT, prints anotados). **Educação é o produto** — sempre tem conteúdo educacional saindo, público inclusive.

- **Doc de estudo/aula (sempre, interno):** denso, para o Lucas estudar e dar aula (passo a passo + o "porquê" + erros comuns + perguntas da audiência). Vive em `docs/<slug>/`.
- **Conteúdo educacional público (sempre também — postar):** toda peça publica algo educacional.
  - **Carrossel/reel:** o próprio formato já é didático + legenda‑resumo educacional + link da doc na bio/descrição.
  - **Vídeo longo / tema complexo (V1–V4, C9, C12, C23, C24):** ganha a **doc-resumo/companheira completa** (`resumo.html` + PDF) linkada na descrição e no Notion.

Template e exemplo: ver [`docs/README.md`](docs/README.md) e [`docs/power-automate-3-fluxos/index.html`](docs/power-automate-3-fluxos/index.html).

---

## 10. Próximos passos recomendados

1. **Popular o ZocLife:** `node --env-file=.env.local scripts/seed.mjs planejamento/seed_content_items.sql` (insere os 45 registros em `content_items`).
2. **Semana 1 (a partir de 22/jun):** roteirizar #13 e #14, gravar R1/R2, e gravar V1 no sábado 27/jun.
3. **Gerar a doc de estudo de cada peça** conforme produz (reusar o template em `docs/`).
4. **Revisão de domingo:** mover status no ZocLife (idea → script → recorded → published) e medir saves/sends da semana.
5. (Opcional) Conectar o CSV a uma view no Notion para visualização extra.

> **Realismo conferido:** por noite, no máximo 1 peça pesada (reel/vídeo) + 1 carrossel; sábado concentra a gravação do vídeo longo; a Copa não soma carga nova de roteiro (shorts já saem da routine). Se uma semana apertar, o vídeo longo é o primeiro a virar "quinzenal" — os carrosséis sustentam a frequência.
