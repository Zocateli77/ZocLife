# ZocLife — Database Schema Reference

Single-user app. Every user-owned row carries `user_id` = the default user
(`a1b2c3d4-e5f6-7890-abcd-ef1234567890`, also in `process.env.APP_USER_ID`).
The user row is seeded by the initial migration. All `id` columns default to
`uuid_generate_v4()` and all timestamps default to `NOW()` unless noted.

Source of truth: `supabase/migrations/20250620000000_initial_schema.sql`.

## Conventions baked into the schema

- **Enums are CHECK constraints** — an out-of-range value fails the insert.
- **Tables with `updated_at`** have a `BEFORE UPDATE` trigger that maintains it;
  never set it manually.
- **RLS is default-deny.** Only the service-role / direct `DATABASE_URL`
  connection can read or write. See SKILL.md for the insertion path.

---

## users
`id, name, email (unique), avatar_url, created_at`
Already seeded. You normally never insert here.

## projects
`id, user_id→users, name, description, objective, status, priority, category, start_date, due_date, progress (NUMERIC 0–100), created_at, updated_at`
- `status` ∈ planning | active | paused | completed | archived (default active)
- `priority` ∈ low | medium | high (default medium)
- `category` ∈ personal | professional | studies | content | health (default personal)

## tasks
`id, user_id→users, title, description, status, priority, category, project_id→projects (nullable), due_date, start_date, estimated_minutes, tags TEXT[], notes, completed_at, created_at, updated_at`
- `status` ∈ backlog | this_week | today | in_progress | waiting | done (default backlog)
- `priority` ∈ low | medium | high
- `category` ∈ personal | training | studies | content | work | projects | home | health | routine
- Set `completed_at` when moving to `done`.

### task_checklist_items
`id, task_id→tasks, title, is_completed, order_index, created_at`

### task_activity
`id, task_id→tasks, user_id→users, action, from_status, to_status, notes, created_at`

## documents
`id, user_id→users, title, description, document_type, url, content, related_task_id→tasks, related_project_id→projects, related_content_id→content_items, created_at, updated_at`
- `document_type` ∈ note | script | link | file (default note)

## content_items
`id, user_id→users, title, description, platform, status, content_type, script_url, script_text, caption, cta, hashtags TEXT[], planned_date, recording_date, publish_date, final_url, notes, created_at, updated_at`
- `platform` ∈ instagram | tiktok | youtube | linkedin | other (default youtube)
- `status` ∈ idea | script | ready_to_record | recorded | editing | scheduled | published | archived (default idea)
- `content_type` ∈ video | carousel | post | reel | story | other (default video)

## calendar_events
`id, user_id→users, title, description, event_type, start_datetime TIMESTAMPTZ, end_datetime TIMESTAMPTZ (nullable), status, priority, related_task_id, related_project_id, related_content_id, related_document_id, is_recurring BOOL, recurrence_rule TEXT, notes, created_at, updated_at`
- `event_type` ∈ task | workout | reading | content | appointment | project | habit | routine (default task)
- `status` ∈ planned | in_progress | completed | cancelled (default planned)
- `priority` ∈ low | medium | high
- **Recurrence**: set `is_recurring = TRUE` and `recurrence_rule = 'weekly:N,...'`
  where N is a weekday `0=Sun … 6=Sat`. The app (`src/lib/calendar/recurrence.ts`)
  expands the anchor row into one occurrence per matching weekday on/after
  `start_datetime`. Time-of-day comes from the anchor; duration from
  `end_datetime - start_datetime`. For a one-off, leave `is_recurring = FALSE`
  and `recurrence_rule = NULL`.
- **Timezone**: store with the `-03` (America/Sao_Paulo) offset, e.g.
  `'2026-06-01 07:00:00-03'`, so the UI shows the intended local time.

## habits
`id, user_id→users, name, description, frequency, frequency_days INTEGER[], target_value NUMERIC, target_unit, color (default #14B8A6), is_active, created_at, updated_at`
- `frequency` ∈ daily | weekly | monthly | specific_days (default daily)
- `frequency_days` uses weekday numbers `0=Sun … 6=Sat` (relevant when frequency = specific_days).

### habit_logs
`id, habit_id→habits, user_id→users, log_date DATE, value NUMERIC, is_completed BOOL, notes, created_at` — UNIQUE(habit_id, log_date)

## workout_plans
`id, user_id→users, name, description, start_date, is_active BOOL (default TRUE), created_at`
- **Only one active plan at a time.** `getActivePlan()` uses `.maybeSingle()`,
  which errors if two rows are active. When seeding a new plan, first
  `UPDATE workout_plans SET is_active = FALSE WHERE user_id = <user> AND id <> <new plan>`.

### workout_days
`id, workout_plan_id→workout_plans, day_of_week INTEGER (0–6, 0=Sun … 6=Sat), title, description, workout_type, created_at`
- `workout_type` ∈ strength | cardio | flexibility | martial_arts | sport | rest | active_rest | other (default strength)
- One conceptual workout per weekday (`getTodayWorkout` matches `new Date().getDay()`).

### workout_exercises
`id, workout_day_id→workout_days, exercise_name, sets, reps, weight NUMERIC, duration_minutes, notes, order_index (default 0), created_at`
- No natural unique key → for idempotent reseeds, `DELETE` the day's exercises
  then re-`INSERT` (see SKILL.md).

### workout_logs
`id, user_id→users, workout_day_id→workout_days (nullable), log_date DATE, status, energy_level (1–5), pain_level (0–5), total_duration_minutes, notes, created_at`
- `status` ∈ planned | completed | skipped | substituted (default completed)

### workout_exercise_logs
`id, workout_log_id→workout_logs, exercise_name, sets, reps, weight, duration_minutes, notes, created_at`

## books
`id, user_id→users, title, author, status, total_chapters, current_chapter, daily_chapter_goal, started_at, finished_at, rating (1–5), notes, created_at, updated_at`
- `status` ∈ want_to_read | reading | paused | completed | abandoned (default reading)

### book_chapter_logs
`id, book_id→books, user_id→users, chapter_number, chapter_title, read_date DATE (default today), summary, main_learning, practical_ideas, quotes, application, rating (1–5), created_at`

### book_reviews
`id, book_id→books, user_id→users, summary, top_learnings, how_to_apply, recommendation BOOL, final_rating (1–5), tags TEXT[], created_at`

## weekly_reviews
`id, user_id→users, week_start DATE, week_end DATE, completed_summary, pending_summary, habits_summary, workouts_summary, reading_summary, content_summary, biggest_win, what_worked, what_did_not_work, next_week_focus, notes, created_at`

## scores (gamification ledger)
`id, user_id→users, score_date DATE (default today), source_type, source_id, points INTEGER, description, created_at`
- `source_type` ∈ habit | workout | reading | content | task | review | bonus

## automation_logs
`id, user_id→users, automation_name, status, started_at, finished_at, error_message, metadata JSONB, created_at`
- `status` ∈ running | success | failed | skipped (default running)

## automation_settings
`id, user_id→users, automation_name, is_enabled, preferred_time TIME (default 08:00), timezone (default America/Sao_Paulo), channel, destination, created_at, updated_at` — UNIQUE(user_id, automation_name)
- `channel` ∈ email | whatsapp
- Seeded with `daily_email_briefing`.
