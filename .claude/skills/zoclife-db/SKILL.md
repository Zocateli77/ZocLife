---
name: zoclife-db
description: >-
  How to read from and especially WRITE data into the ZocLife (zoc-life)
  Supabase/Postgres database — the keys to use, which table each thing belongs
  in, the enum values and conventions, and the safe idempotent migration
  workflow. Use this skill whenever the task involves inserting, seeding,
  updating, or backfilling ZocLife data of any kind: workouts/training plans
  and exercises, calendar events or recurring routine, tasks, habits and habit
  logs, projects, content items, books and reading logs, weekly reviews,
  gamification scores, or automation settings — even if the user just says
  "add my workout", "put this on my calendar", "create these tasks", "register
  my habits", or "seed some data" without naming a table. Also use it when
  deciding where a piece of data should live, what the user_id/keys are, or how
  to apply a migration to the live database.
---

# Inserting data into ZocLife

ZocLife is a single-user personal planning app (Next.js + Supabase Postgres).
This skill is the map: it tells you **where each thing goes**, **what keys to
use**, and **how to write to the database without breaking it**.

## The one key you always need

Every user-owned row uses this `user_id`:

```
a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

It also lives in `process.env.APP_USER_ID` / `DEFAULT_USER_ID`
(`src/lib/auth/constants.ts`). The `users` row is already seeded — don't
recreate it.

Connection / credentials live in `.env.local` (gitignored): `DATABASE_URL` is
the direct service-role Postgres connection used for writes;
`SUPABASE_SERVICE_ROLE_KEY` is the service key; `NEXT_PUBLIC_SUPABASE_*` are the
public client keys. **Never** put secrets in committed files or in migrations.

## Why you can't just use the public client

Row-Level Security is **default-deny** on every table (no policies). The
anon/publishable key can't read or write. Writes must go through the
**service role** — either the app's server-side client
(`createServerSupabaseClient`, which uses the service key) or a direct
`DATABASE_URL` connection. For seeding/backfilling, prefer a SQL migration
applied over `DATABASE_URL` (below).

## Where does each thing go?

Read `references/schema.md` for the full column list, enum values, and foreign
keys of every table before writing — getting an enum or a required column wrong
fails the insert. Quick routing:

| The user gives you… | Table(s) |
|---|---|
| A training/gym plan, split, exercises | `workout_plans` → `workout_days` → `workout_exercises` |
| A logged workout / loads lifted | `workout_logs` → `workout_exercise_logs` |
| Events, meetings, routine, time blocks | `calendar_events` (recurring via rule) |
| To-dos, action items | `tasks` (+ `task_checklist_items`) |
| Habits to track | `habits` (+ `habit_logs` for check-ins) |
| A project / initiative | `projects` |
| Video/post ideas, content pipeline | `content_items` |
| Books, reading, chapter notes | `books` → `book_chapter_logs` / `book_reviews` |
| A weekly retrospective | `weekly_reviews` |
| Points / gamification | `scores` |
| Notes, scripts, links | `documents` |
| Briefing/automation config | `automation_settings` |

## Conventions you must follow

These are easy to get wrong and the schema reference explains each in context:

- **Calendar recurrence**: one anchor row with `is_recurring = TRUE` and
  `recurrence_rule = 'weekly:N,...'` (`0=Sun … 6=Sat`). The app expands it into
  weekly occurrences — do NOT create one row per week. One-offs:
  `is_recurring = FALSE`, `recurrence_rule = NULL`.
- **Timezones**: store `TIMESTAMPTZ` with the `-03` offset (e.g.
  `'2026-06-01 07:00:00-03'`) so the UI shows the right local time.
- **Workout active plan**: only one `workout_plans` row may have
  `is_active = TRUE`. Before activating a new plan, deactivate the others
  (`getActivePlan()` errors on multiple actives).
- **Weekday numbers** are consistently `0=Sun … 6=Sat` across `workout_days`,
  `habits.frequency_days`, and recurrence rules.

## The safe write workflow (seeding / backfilling)

Write data as an **idempotent SQL migration** so it's version-controlled and
re-runnable. Name files `supabase/migrations/<UTC-timestamp>_<slug>.sql`,
sorting after existing ones.

Make every migration idempotent:

- **Parent rows with fixed UUIDs**: generate stable UUIDs once
  (`node -e "console.log(crypto.randomUUID())"`), then
  `INSERT ... ON CONFLICT (id) DO NOTHING`.
- **Child rows without a natural unique key** (e.g. `workout_exercises`):
  `DELETE` the children for the known parent id(s) first, then `INSERT`.
- **State flips** (e.g. deactivating old workout plans): use a guarded `UPDATE`
  like `... WHERE user_id = <user> AND id <> <new id>`.

### Applying a migration to the live database

⚠️ Do **not** rely on `npm run db:migrate` to apply a single new file — it
replays ALL migrations from the start and aborts because the initial schema's
`CREATE TRIGGER` statements already exist ("trigger already exists").

Instead apply only the files you added, with the bundled script:

```bash
node --env-file=.env.local \
  .claude/skills/zoclife-db/scripts/apply-migrations.mjs \
  20260621010000_my_new_migration.sql
```

It connects via `DATABASE_URL` and runs each named file in order.

### Verify after applying

Query back what you inserted (counts, the active plan, event times rendered in
`America/Sao_Paulo`) over `DATABASE_URL` to confirm before telling the user it's
done. Example:

```bash
node --env-file=.env.local -e "const pg=require('pg');(async()=>{const c=new pg.Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();const r=await c.query(\"select title, to_char(start_datetime at time zone 'America/Sao_Paulo','HH24:MI') t, recurrence_rule from calendar_events where user_id='a1b2c3d4-e5f6-7890-abcd-ef1234567890' order by start_datetime\");console.table(r.rows);await c.end();})()"
```

## Example: a recurring calendar event

```sql
INSERT INTO calendar_events
  (id, user_id, title, event_type, start_datetime, end_datetime,
   status, priority, is_recurring, recurrence_rule)
VALUES
  ('<fixed-uuid>', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'Academia · Treino A', 'workout',
   '2026-06-01 07:00:00-03', '2026-06-01 08:00:00-03',
   'planned', 'medium', TRUE, 'weekly:1')
ON CONFLICT (id) DO NOTHING;
```

This shows on every Monday from June 1 onward, 07:00–08:00 BRT.

## Don't write to these blindly

`users` is already seeded. `automation_settings` already has
`daily_email_briefing`. Anything with `updated_at` has a trigger — never set it
by hand. When in doubt about a column or enum, check `references/schema.md`.
