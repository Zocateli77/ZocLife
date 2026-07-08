# Zoc Life — Documentação do Projeto

> Painel central de execução pessoal do Lucas Zocateli (ZocLabs). Reúne, num único app, a gestão de **tarefas, hábitos, treinos, estudos/livros, conteúdo, projetos, calendário, revisão semanal, gamificação e vícios**, com assistentes de IA e um briefing diário automático por e-mail.

Este documento explica o projeto por inteiro: o que é, a stack, a arquitetura, os módulos e como rodar. Para o resumo rápido e as convenções essenciais, veja o [`CLAUDE.md`](../CLAUDE.md) na raiz.

---

## 1. Visão geral

- **Nome do pacote:** `zoc-life` (v0.1.0, privado). Título da aba: "Zoc Life — Painel de Execução Pessoal".
- **Para quem:** uso **pessoal e single-user** (um usuário fixo, o Lucas). Não há multi-tenant nem cadastro público.
- **Idioma:** interface e conteúdo em **português do Brasil** (`<html lang="pt-BR">`).
- **Estado:** as 12 fases planejadas estão concluídas (ver tabela no [`README.md`](../README.md)) — fundação, tarefas/Kanban, calendário, hábitos, treinos, estudos, conteúdo, projetos, revisão semanal, gamificação, polimento e deploy/automação. Módulos posteriores (Meu Dia e Vícios) foram somados depois.

---

## 2. Stack & dependências

| Camada | Tecnologia | Papel |
|---|---|---|
| Framework | **Next.js 16.2.9** (App Router) | Rotas, Server Components, Route Handlers |
| UI | **React 19.2.4** + **TypeScript 5** | Componentes e tipagem |
| Estilo | **Tailwind CSS 4** (`@tailwindcss/postcss`) | Design system via tokens em `globals.css` (sem `tailwind.config.js`) |
| Dados | **Supabase JS** (`@supabase/supabase-js`) sobre **Postgres** | Acesso server-side via *service role* |
| Estado cliente | **TanStack React Query 5** | Cache/estado de dados no client |
| IA | **OpenAI 6.x** (`gpt-4o-mini`) | Refino de tarefas/conteúdo e chat de estratégia |
| Integrações | **googleapis** | Envio de e-mail (Gmail) e busca de livros (Google Books) |
| Sessão | **jose** | Assinatura/verificação do cookie de sessão |
| Validação | **zod 4** | Schemas de entrada e *structured outputs* da IA |
| Drag & drop | **@dnd-kit/core** | Movimentação de cards no Kanban |
| Tema | **next-themes** | Alternância claro/escuro |
| Ícones/estilo | **lucide-react**, **class-variance-authority**, **clsx**, **tailwind-merge** | Ícones e composição de classes |
| Datas | **date-fns 4** | Manipulação de datas/recorrência |
| Migrations | **pg** (dev) | Cliente Postgres usado pelos scripts `scripts/*.mjs` |
| Server guard | **server-only** | Impede que módulos server vazem para o client |

> ⚠️ **Observação:** o `README.md` menciona `recharts`, mas ele **não** está instalado (não consta no `package.json`). Considere só as dependências acima como fonte de verdade.

---

## 3. Estrutura de diretórios

```
ZocPlanning/
├── CLAUDE.md              # Resumo + convenções (importa AGENTS.md)
├── AGENTS.md              # Aviso: Next.js 16 tem breaking changes
├── README.md              # Setup, fases, deploy, automação
├── package.json           # zoc-life
├── next.config.ts         # Config mínima
├── postcss.config.mjs     # Plugin Tailwind 4
├── vercel.json            # Cron do briefing diário
├── .env.example           # Todas as variáveis de ambiente
├── docs/
│   └── PROJECT.md         # (este arquivo)
├── scripts/
│   ├── migrate.mjs        # Aplica todas as migrations
│   └── seed.mjs           # Roda um único arquivo .sql
├── supabase/
│   └── migrations/        # Schema + seeds (.sql, ordem por timestamp)
├── public/                # SVGs estáticos
├── .github/workflows/
│   └── daily-briefing.yml # Gatilho manual do briefing
└── src/
    ├── app/
    │   ├── layout.tsx      # Fontes + ThemeProvider + QueryProvider
    │   ├── globals.css     # Tokens do design system (paleta laranja)
    │   ├── login/page.tsx  # Rota pública
    │   ├── (app)/          # Route group autenticado (13 páginas)
    │   │   ├── layout.tsx  # Envolve tudo no AppShell
    │   │   └── .../page.tsx
    │   └── api/            # Route handlers (auth, IA, fetch por id, automação)
    ├── components/
    │   ├── shell/          # app-shell, app-sidebar, topbar, mobile-nav, theme-toggle, logo
    │   ├── ui/             # Biblioteca base (button, card, input, sheet, badge, ...)
    │   ├── providers/      # query-provider, theme-provider
    │   ├── dashboard/ tasks/ calendar/ habits/ workouts/ studies/
    │   ├── content/ projects/ reviews/ gamification/ vices/
    └── lib/
        ├── supabase/       # server.ts (service role) + client.ts (anon, uploads)
        ├── auth/           # session.ts, constants.ts
        ├── ai/             # refino de tarefa/conteúdo, chat, brand
        ├── automation/     # coleta do briefing diário
        ├── email/          # geração do HTML do e-mail
        ├── notifications/  # envio (Gmail; WhatsApp é stub)
        └── <domínio>/      # tasks, calendar, habits, studies, workouts,
                            #   projects, content, vices, reviews, gamification
                            #   cada um com queries.ts / actions.ts / types.ts / ...
```

---

## 4. Rotas (App Router)

Páginas autenticadas ficam no route group `src/app/(app)/`, que aplica o `AppShell` (sidebar + topbar).

| Rota | Módulo |
|---|---|
| `/` | Dashboard (visão geral do dia) |
| `/meu-dia` | Meu Dia — planner por hora |
| `/tarefas` | Tarefas / Kanban |
| `/calendario` | Calendário (mês / semana / dia) |
| `/habitos` | Hábitos e metas |
| `/treinos` | Treinos |
| `/estudos` | Estudos e livros |
| `/conteudo` | Pipeline de conteúdo + assistentes de IA |
| `/projetos` | Projetos |
| `/revisao` | Revisão semanal |
| `/gamificacao` | Gamificação / pontuação |
| `/vicios` | Vícios (hábitos a reduzir) |
| `/configuracoes` | Configurações |
| `/login` | **Pública** — formulário de login |

---

## 5. Módulos / features

### Tarefas (`/tarefas`)
Quadro Kanban com refino por IA. O usuário descreve a tarefa em linguagem natural e a IA gera título, prioridade, categoria, prazo, estimativa em minutos, tags e um checklist de subtarefas — que passam por uma etapa de revisão antes de virar tarefa. Cada tarefa tem checklist interativo, log de atividade (mudanças de status), vínculo com projeto e rastreio de tempo.
- Componentes: `src/components/tasks/*` (`kanban-board`, `kanban-column`, `task-card`, `task-detail-sheet`, `task-form`, `ai-task-composer`)
- Dados: `src/lib/tasks/*` · Status no banco: `backlog · this_week · today · in_progress · waiting · done`

### Conteúdo (`/conteudo`)
Pipeline de produção de conteúdo social, do jeito de um social media. Colunas por status; cada item guarda plataforma, tipo, legenda, CTA, hashtags, roteiro e datas. Suporta **anexos de arquivo** (slides de carrossel, thumbnails, footage) via *signed URLs* do Supabase Storage. Dois assistentes de IA:
- **Chat** (`ai-content-chat`) — conversa em streaming com a persona "Social Media Manager do ZocLabs", com prompts rápidos (planejar semana, escrever legendas, briefings de arte, responder comentários, analisar métricas).
- **Composer/refino** (`ai-content-composer`) — transforma uma ideia solta num rascunho estruturado (título, plataforma, tipo, legenda, CTA, hashtags, roteiro, data), com revisão antes de salvar no pipeline.
- Componentes: `src/components/content/*` · Dados: `src/lib/content/*`
- Status: `idea · script · ready_to_record · recorded · editing · scheduled · published · archived`

### Meu Dia (`/meu-dia`) e Calendário (`/calendario`)
Meu Dia é uma timeline por hora do dia atual; o Calendário oferece as visões de mês/semana/dia. Eventos têm tipo (`task`, `workout`, `reading`, `content`, `appointment`, `project`, `habit`, `routine`), status e podem estar **ligados** a uma tarefa, projeto, conteúdo ou documento. Há suporte a **recorrência** (expansão de ocorrências).
- Componentes: `src/components/calendar/*` (`day-planner-view`, `calendar-view`, `event-form`, `event-detail-sheet`) · Dados: `src/lib/calendar/*` (inclui `recurrence.ts`)

### Hábitos (`/habitos`)
Criação e acompanhamento de hábitos com frequência (diária/semanal/mensal/dias específicos), meta, unidade, cor e estatísticas. Registro diário em `habit_logs`.
- Componentes: `src/components/habits/*` · Dados: `src/lib/habits/*` (inclui `stats.ts`)

### Vícios (`/vicios`)
Espelho dos hábitos, mas para **reduzir** algo (ex.: "Celular", limite 1:30/dia). O usuário registra o uso do dia; a barra mostra o progresso em relação ao limite (verde se abaixo, vermelho se acima) e o card exibe streak atual, melhor streak, média semanal e % de aderência.
- Componentes: `src/components/vices/*` · Dados: `src/lib/vices/*` (inclui `stats.ts`)

### Demais módulos
- **Treinos** (`/treinos`) — planos, dias, exercícios e logs de execução com carga por exercício, energia e dor. `src/components/workouts/*`, `src/lib/workouts/*`.
- **Estudos/Livros** (`/estudos`) — lista de leitura, logs por capítulo (aprendizado, ideias práticas, citações) e resenhas; busca de livros via Google Books. `src/components/studies/*`, `src/lib/studies/*`.
- **Projetos** (`/projetos`) — projetos de vida/trabalho com status, prioridade e progresso, referenciados por tarefas/eventos. `src/lib/projects/*`.
- **Revisão Semanal** (`/revisao`) — reflexão da semana (o que funcionou, maior vitória, foco da próxima). `src/lib/reviews/*`.
- **Gamificação** (`/gamificacao`) — placar de pontos (`scores`) agregando hábitos, treinos, leitura, conteúdo, tarefas e revisões. `src/lib/gamification/*`.

### UI compartilhada
`src/components/ui/` traz a biblioteca base (button, card, input, textarea, select, badge, sheet, separator, label, skeleton, progress, page-header, confirm-dialog, empty-state), com variantes via `class-variance-authority` e composição de classes com `clsx` + `tailwind-merge`.

---

## 6. Arquitetura & camada de dados

O padrão central é **por domínio**, dentro de `src/lib/<domínio>/`:

- **`queries.ts`** — funções de **leitura** (async, executadas no server). Ex.: `getTasks()`, `getTaskById()`, `getDashboardTaskStats()`. As páginas (Server Components) chamam essas funções direto e passam os dados iniciais para os componentes client.
- **`actions.ts`** — **mutações** marcadas com `"use server"` (criar/atualizar/excluir). Além de gravar no Supabase, cuidam de efeitos colaterais como `revalidatePath` e **sincronização de calendário** (ex.: mexer no prazo de uma tarefa cria/atualiza o evento correspondente) e o log de atividade.
- **`types.ts` / `constants.ts` / `stats.ts` / `utils.ts`** — tipos do domínio, enums/labels e cálculos.

Clientes Supabase em `src/lib/supabase/`:
- **`server.ts`** → `createServerSupabaseClient()` usa a **service role key** e é `server-only`. É o cliente de todas as queries, actions e route handlers. Como o acesso é via service role, ele **ignora o RLS**.
- **`client.ts`** → cliente **anon** no browser, usado **só para uploads de arquivo** direto no Storage (evitando o limite de body do Next).

Estado no client é gerenciado pelo **TanStack Query** (configurado em `src/components/providers/query-provider.tsx`), com estado local de UI via `useState`.

Como é single-user, o `user_id` vem de uma constante fixa (`DEFAULT_USER_ID` em `src/lib/auth/constants.ts`, igual ao seed `a1b2c3d4-…`), até uma futura migração para Supabase Auth.

---

## 7. Modelo de dados (Postgres / Supabase)

Schema em `supabase/migrations/`, aplicado em ordem por timestamp. A migration inicial cria 22 tabelas; depois vêm `content_attachments` e `vices`/`vice_logs`.

| Tabela | Propósito | Enums/campos-chave |
|---|---|---|
| `users` | Usuário do app | seed único: Lucas |
| `projects` | Projetos | status `planning/active/paused/completed/archived`; priority; category |
| `tasks` | Tarefas | status `backlog/this_week/today/in_progress/waiting/done`; priority; `tags[]`; `estimated_minutes` |
| `task_checklist_items` | Subtarefas | `is_completed`, `order_index` |
| `task_activity` | Trilha de auditoria da tarefa | `action`, `from_status`, `to_status` |
| `documents` | Notas/scripts/links/arquivos | `document_type`; relações com task/project/content |
| `content_items` | Itens de conteúdo | platform; status (8 estágios); content_type; `hashtags[]`; datas |
| `content_attachments` | Anexos de conteúdo | arquivos em Storage (signed URLs) |
| `calendar_events` | Eventos | `event_type` (8); status; `is_recurring`, `recurrence_rule`; relações |
| `habits` / `habit_logs` | Hábitos e registros | frequency; `target_value/unit`; log diário único por dia |
| `books` / `book_chapter_logs` / `book_reviews` | Leitura | status; capítulos; aprendizados; resenha |
| `workout_plans` / `workout_days` / `workout_exercises` | Programa de treino | `workout_type`; `day_of_week` |
| `workout_logs` / `workout_exercise_logs` | Execução de treino | status; energia/dor; carga por exercício |
| `weekly_reviews` | Revisão semanal | resumos + foco da próxima semana |
| `scores` | Placar de gamificação | `source_type` (habit/workout/reading/content/task/review/bonus); `points` |
| `vices` / `vice_logs` | Vícios a reduzir | `limit_value/unit`; registro diário |
| `automation_logs` | Auditoria de automações | status `running/success/failed/skipped`; `metadata` JSONB |
| `automation_settings` | Preferências de automação | `preferred_time`, `timezone`, `channel` (email/whatsapp) |

**Segurança:** **RLS habilitado em todas as tabelas, sem policies nomeadas** → *default-deny* para as roles anon/authenticated. Só a service role (backend) acessa. Triggers `update_updated_at_column()` mantêm `updated_at`. Índices em `user_id`, `status`, datas e FKs.

---

## 8. Rotas de API (`src/app/api/`)

CRUD acontece majoritariamente por **Server Actions**; os route handlers cobrem casos específicos (auth, IA, busca por id, faixa de calendário, automação).

| Endpoint | Método(s) | Função |
|---|---|---|
| `auth/login` | POST | Valida email/senha e cria cookie de sessão |
| `auth/logout` | POST | Encerra a sessão |
| `tasks/ai-refine` | POST | Rascunho estruturado de tarefa via OpenAI |
| `tasks/[id]` | GET | Tarefa com checklist e relações |
| `calendar` | GET | Eventos por intervalo (`start`, `end`) |
| `calendar/[id]` | GET / PATCH / DELETE | Um evento |
| `content/ai-refine` | POST | Rascunho estruturado de conteúdo via OpenAI |
| `content/ai-chat` | POST | Chat de estratégia em **streaming (SSE)** |
| `habits/[id]` | GET | Hábito com estatísticas |
| `studies/search` | GET | Busca de livros (Google Books) |
| `vices/[id]` | GET | Vício com estatísticas |
| `automation/daily-briefing` | GET / POST | Dispara o briefing diário (autorização Bearer) |

As rotas de IA retornam **503** se `OPENAI_API_KEY` não estiver configurada; corpos são validados com zod.

---

## 9. Camada de IA (`src/lib/ai/`)

Modelo padrão **`gpt-4o-mini`** (via `OPENAI_MODEL`). Saídas estruturadas usam `zodResponseFormat` sobre schemas zod.

- **Refino de tarefa** — `refine-task.ts` + `refined-task-schema.ts`. Contexto do prompt inclui projetos ativos, categorias e a data; regras (ex.: no máx. 8 subtarefas, não inventar datas). → `POST /api/tasks/ai-refine`.
- **Refino de conteúdo** — `refine-content.ts` + `refined-content-schema.ts`. Injeta o guia de marca ZocLabs. → `POST /api/content/ai-refine`.
- **Chat de conteúdo** — `content-chat.ts`, resposta em streaming, system prompt de `buildSocialManagerPrompt()`. → `POST /api/content/ai-chat`.
- **Marca** — `zoclabs-brand.ts` condensa o guia de marca do canal ZocLabs (criador Lucas Zocateli · Power Platform/SharePoint & IA · ZocTech; bordão "Tecnologia na prática"; pilares **Mão na Massa ~50%**, **Lab News ~20%**, **Carreira & Mente ~20%**, **Cases & Bastidores ~10%**), usado nos system prompts.

---

## 10. Automação & integrações

**Briefing diário por e-mail:**
1. `src/lib/automation/collect-daily-briefing.ts` agrega, em paralelo, tarefas do dia, eventos, hábitos, treino, progresso de leitura, conteúdo e projetos ativos.
2. `src/lib/email/generate-daily-briefing-html.ts` monta o HTML.
3. `src/lib/notifications/send-notification.ts` envia via **Gmail (OAuth2)**; o canal WhatsApp existe como *stub*. Se o Gmail não estiver configurado, apenas registra e retorna `{ skipped: true }`.
4. Execuções ficam auditadas em `automation_logs`.

**Agendamento:** o disparo é feito por **Vercel Cron** — `vercel.json` chama `POST /api/automation/daily-briefing` no schedule `30 8 * * *` (crons da Vercel rodam em **UTC**). O endpoint exige `Authorization: Bearer <DAILY_BRIEFING_SECRET>`. O workflow `.github/workflows/daily-briefing.yml` foi rebaixado para **gatilho manual** (`workflow_dispatch`) — o agendamento migrou para a Vercel (o README ainda descreve o modelo antigo em cron do GitHub).

**Google:** Gmail (envio do briefing) e Google Books (busca em `/api/studies/search`), ambos via `googleapis`.

---

## 11. Autenticação

Login simples, pré-Supabase Auth:
- Credenciais conferidas contra `APP_LOGIN_EMAIL` / `APP_LOGIN_PASSWORD` do ambiente.
- Sessão em cookie **HttpOnly** assinado com **jose** (`session.ts`), validade ~30 dias.
- Rotas públicas: `PUBLIC_ROUTES = ['/login']` (`src/lib/auth/constants.ts`).
- Como o app é single-user, todo dado usa o `DEFAULT_USER_ID` fixo. A migração para Supabase Auth está prevista.

---

## 12. Design system

Tailwind CSS 4 **sem `tailwind.config.js`** — os tokens vivem em `src/app/globals.css` via `@theme inline`.

- **Paleta da UI: laranja / preto / cinza.** Os nomes de variável CSS (`--teal`, `--amber`) foram mantidos por compatibilidade, mas os **valores são laranja**: primário `#e85002`, acento `#f16001`, escuro `#c10801`. Temas claro e escuro definidos em `:root` e `.dark`, alternados com **next-themes**.
- **Fontes** (carregadas em `layout.tsx` via `next/font/google`): **Inter** (corpo), **Space Grotesk** (títulos), **JetBrains Mono** (mono/`.eyebrow`).
- Detalhes: fundo em grade de 44px, utilitários `.glow-teal`/`.glow-amber`/`.accent-bar`, foco visível com ring, respeito a `prefers-reduced-motion` e scrollbar custom.

> 🎨 **Não confundir duas paletas:** a **UI** do app é laranja (acima). Já o guia em `src/lib/ai/zoclabs-brand.ts` (Ink `#0E1726`, Lab Teal `#14B8A6`, Insight Amber `#F59E0B`) descreve a **identidade de conteúdo do canal** e é usado **apenas** nos prompts de IA de briefing de arte — não é a paleta da interface.

---

## 13. Setup local, ambiente e deploy

**Rodar localmente** (ver [`README.md`](../README.md)):
```bash
npm install
cp .env.example .env.local          # preencha as credenciais
npm run db:migrate                   # aplica todas as migrations
node --env-file=.env.local scripts/seed.mjs supabase/migrations/20250620100000_seed_sample_project.sql
node --env-file=.env.local scripts/seed.mjs supabase/migrations/20250620120000_seed_habits.sql
node --env-file=.env.local scripts/seed.mjs supabase/migrations/20250620140000_seed_workouts.sql
npm run dev                          # http://localhost:3000
```
Login com `APP_LOGIN_EMAIL` / `APP_LOGIN_PASSWORD`.

**Scripts npm:** `dev`, `build`, `start`, `lint`, `db:migrate`. (Seeds são rodados manualmente via `scripts/seed.mjs`.)

**Variáveis de ambiente** (lista completa em `.env.example`), agrupadas:
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` (direto ao Postgres, só para migrations/scripts).
- **Auth:** `APP_LOGIN_EMAIL`, `APP_LOGIN_PASSWORD`, `SESSION_SECRET` (≥ 32 chars), `APP_USER_ID` (deve bater com o seed), `APP_BASE_URL`.
- **Automação:** `DAILY_BRIEFING_SECRET`, `GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN/FROM_EMAIL`, `DAILY_BRIEFING_TO_EMAIL`.
- **OpenAI:** `OPENAI_API_KEY`, `OPENAI_MODEL`.

**Deploy (Vercel):** conectar o repositório, configurar as envs (marcando `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET` e `DAILY_BRIEFING_SECRET` como *sensitive*), deploy automático a cada push. O cron do briefing diário vem de `vercel.json`.

---

## 14. Convenção importante: Next.js 16

O [`AGENTS.md`](../AGENTS.md) alerta: **"This is NOT the Next.js you know."** A versão é a **16.2.9**, com APIs, convenções e estrutura possivelmente diferentes do que se assume. Antes de escrever código de framework, **consulte o guia em `node_modules/next/dist/docs/`** e respeite os avisos de depreciação.
