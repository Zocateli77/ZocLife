import type { CalendarEventWithRelations } from "./types";

// Recurrence is modelled as a single anchor event (its start_datetime is the
// first occurrence) plus a weekly rule. Rules use the format `weekly:N,N,...`
// where N is a weekday number (0 = Sunday ... 6 = Saturday), matching
// JavaScript's Date.getDay()/getUTCDay() and the workout_days convention.

export const WEEKDAY_OPTIONS: { value: number; label: string; short: string }[] =
  [
    { value: 0, label: "Domingo", short: "Dom" },
    { value: 1, label: "Segunda", short: "Seg" },
    { value: 2, label: "Terça", short: "Ter" },
    { value: 3, label: "Quarta", short: "Qua" },
    { value: 4, label: "Quinta", short: "Qui" },
    { value: 5, label: "Sexta", short: "Sex" },
    { value: 6, label: "Sábado", short: "Sáb" },
  ];

export function parseWeeklyRule(rule: string | null | undefined): number[] | null {
  if (!rule) return null;
  const match = rule.trim().toLowerCase().match(/^weekly:([0-6](?:,[0-6])*)$/);
  if (!match) return null;
  const days = Array.from(new Set(match[1].split(",").map(Number))).sort(
    (a, b) => a - b,
  );
  return days.length ? days : null;
}

export function buildWeeklyRule(days: number[]): string {
  const unique = Array.from(new Set(days)).sort((a, b) => a - b);
  return `weekly:${unique.join(",")}`;
}

export function describeRecurrenceRule(rule: string | null | undefined): string {
  const days = parseWeeklyRule(rule);
  if (!days) return rule ?? "";
  if (days.length === 7) return "Todos os dias";
  if (days.length === 5 && days.every((d) => d >= 1 && d <= 5)) {
    return "Toda semana (seg–sex)";
  }
  const labels = days
    .map((d) => WEEKDAY_OPTIONS.find((o) => o.value === d)?.short)
    .filter(Boolean);
  return `Toda semana · ${labels.join(", ")}`;
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Expands a recurring anchor event into concrete occurrences that fall inside
 * [rangeStart, rangeEnd]. Each occurrence keeps the anchor's id (so clicking it
 * resolves the parent for detail/edit) and carries a unique `occurrence_key`
 * for use as a React key. Time-of-day is preserved from the anchor.
 *
 * If the rule cannot be parsed, the anchor itself is returned when it lands in
 * range, so events are never silently dropped.
 */
export function expandRecurringEvent(
  event: CalendarEventWithRelations,
  rangeStart: Date,
  rangeEnd: Date,
): CalendarEventWithRelations[] {
  const days = parseWeeklyRule(event.recurrence_rule);
  const anchor = new Date(event.start_datetime);

  if (!days) {
    return anchor >= rangeStart && anchor <= rangeEnd ? [event] : [];
  }

  const durationMs = event.end_datetime
    ? new Date(event.end_datetime).getTime() - anchor.getTime()
    : null;

  const hours = anchor.getUTCHours();
  const minutes = anchor.getUTCMinutes();
  const seconds = anchor.getUTCSeconds();

  const anchorDay = startOfUtcDay(anchor);
  const rangeStartDay = startOfUtcDay(rangeStart);
  let cursor = anchorDay > rangeStartDay ? anchorDay : rangeStartDay;

  const out: CalendarEventWithRelations[] = [];
  let guard = 0;
  while (cursor.getTime() <= rangeEnd.getTime() && guard < 1000) {
    guard += 1;
    if (days.includes(cursor.getUTCDay())) {
      const occStart = new Date(
        Date.UTC(
          cursor.getUTCFullYear(),
          cursor.getUTCMonth(),
          cursor.getUTCDate(),
          hours,
          minutes,
          seconds,
        ),
      );
      if (
        occStart.getTime() >= anchor.getTime() &&
        occStart.getTime() >= rangeStart.getTime() &&
        occStart.getTime() <= rangeEnd.getTime()
      ) {
        const occEnd =
          durationMs != null ? new Date(occStart.getTime() + durationMs) : null;
        const ymd = `${occStart.getUTCFullYear()}${String(
          occStart.getUTCMonth() + 1,
        ).padStart(2, "0")}${String(occStart.getUTCDate()).padStart(2, "0")}`;
        out.push({
          ...event,
          start_datetime: occStart.toISOString(),
          end_datetime: occEnd ? occEnd.toISOString() : null,
          occurrence_key: `${event.id}__${ymd}`,
        });
      }
    }
    cursor = new Date(cursor.getTime() + DAY_MS);
  }

  return out;
}
