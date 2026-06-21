# Zoc Life

Painel central de execução pessoal — tarefas, hábitos, treinos, estudos, conteúdo, projetos, calendário e gamificação.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** + design system ZocLabs
- **Supabase** (Postgres) — acesso server-side via service role
- **TanStack Query**, **recharts**, **googleapis**

## Setup local

```bash
npm install
cp .env.example .env.local
# Edite .env.local com credenciais Supabase e login

npm run db:migrate
node --env-file=.env.local scripts/seed.mjs supabase/migrations/20250620100000_seed_sample_project.sql
node --env-file=.env.local scripts/seed.mjs supabase/migrations/20250620120000_seed_habits.sql
node --env-file=.env.local scripts/seed.mjs supabase/migrations/20250620140000_seed_workouts.sql

npm run dev
```

Login em http://localhost:3000 com `APP_LOGIN_EMAIL` / `APP_LOGIN_PASSWORD`.

## Módulos

| Fase | Módulo | Status |
|------|--------|--------|
| 1 | Fundação | ✅ |
| 2 | Tarefas/Kanban | ✅ |
| 3 | Calendário | ✅ |
| 4 | Hábitos e Metas | ✅ |
| 5 | Treinos | ✅ |
| 6 | Estudos e Livros | ✅ |
| 7 | Conteúdo | ✅ |
| 8 | Projetos | ✅ |
| 9 | Revisão Semanal | ✅ |
| 10 | Gamificação | ✅ |
| 11 | Polimento | ✅ |
| 12 | Deploy e Automação | ✅ |

## Deploy na Vercel

1. Conecte o repositório GitHub à Vercel
2. Configure variáveis de ambiente (ver `.env.example`)
3. Marque `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `DAILY_BRIEFING_SECRET` como sensitive
4. Deploy automático a cada push

## Automação diária (GitHub Actions)

Workflow `.github/workflows/daily-briefing.yml` dispara às 08:00 (São Paulo) via cron 11:00 UTC.

Secrets necessários no GitHub:
- `APP_BASE_URL` — URL de produção (ex: https://zoc-life.vercel.app)
- `DAILY_BRIEFING_SECRET` — mesmo valor da env na Vercel

Teste manual:
```bash
curl -X POST "http://localhost:3000/api/automation/daily-briefing" \
  -H "Authorization: Bearer SEU_SECRET"
```

## Variáveis de ambiente

Ver `.env.example` para lista completa.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run db:migrate
```

---

ZocLabs · Zoc Life v0.1.0
