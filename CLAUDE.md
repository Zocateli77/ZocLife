@AGENTS.md

# Zoc Life (`zoc-life`)

Painel central de **execução pessoal** (single-user, PT-BR) do Lucas Zocateli / ZocLabs. Reúne num só app: **tarefas** (Kanban), **hábitos**, **treinos**, **estudos/livros**, **conteúdo** (com assistentes de IA), **projetos**, **calendário**, **Meu Dia**, **revisão semanal**, **gamificação** e **vícios** — mais um **briefing diário** automático por e-mail.

> 📖 Explicação completa (arquitetura, módulos, modelo de dados, IA, automação, deploy) em **[docs/PROJECT.md](docs/PROJECT.md)**.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres, acesso *service-role* server-side) · TanStack Query · OpenAI (`gpt-4o-mini`) · googleapis (Gmail + Google Books).

## Convenções-chave

- **App Router** com route group `src/app/(app)/` (páginas autenticadas dentro do `AppShell`); `/login` é a única rota pública.
- **Server Components por padrão**; use `"use client"` explicitamente. Módulos server usam `import "server-only"`.
- **Dados por domínio** em `src/lib/<domínio>/`: `queries.ts` (leitura, server) · `actions.ts` (`"use server"`, mutação + `revalidatePath` + sync de calendário) · `types.ts`.
- **Supabase**: `src/lib/supabase/server.ts` (service role, ignora RLS) para tudo no server; `client.ts` (anon) só para uploads no Storage. App é single-user → `user_id` vem de `DEFAULT_USER_ID` (`src/lib/auth/constants.ts`).
- **RLS**: todas as tabelas têm RLS *default-deny*; só a service role acessa. Migrations em `supabase/migrations/*.sql`.
- **Tailwind 4 sem `tailwind.config.js`** — tokens em `src/app/globals.css` via `@theme inline`. Paleta da **UI é laranja** (`--teal`/`--amber` são nomes legados com valores laranja); a paleta de marca em `src/lib/ai/zoclabs-brand.ts` é só para prompts de IA, não para a interface.
- **IA** em `src/lib/ai/` com *structured outputs* (zod). CRUD é feito por Server Actions; os route handlers em `src/app/api/` cobrem auth, IA, fetch por id, calendário e automação.
- Alias de import: `@/*` → `./src/*`.

## Comandos

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm run lint         # ESLint
npm run db:migrate   # aplica todas as migrations (usa .env.local)
# seed de um arquivo:
node --env-file=.env.local scripts/seed.mjs <caminho/arquivo.sql>
```

## ⚠️ Next.js 16

Ver `AGENTS.md` (importado acima): esta versão (**16.2.9**) tem breaking changes. **Leia o guia em `node_modules/next/dist/docs/` antes de escrever código de framework.**
