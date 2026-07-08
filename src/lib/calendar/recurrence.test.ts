import { describe, it, expect } from "vitest";
import {
  parseWeeklyRule,
  buildWeeklyRule,
  describeRecurrenceRule,
  expandRecurringEvent,
} from "./recurrence";
import type { CalendarEventWithRelations } from "./types";

function makeEvent(
  overrides: Partial<CalendarEventWithRelations> = {},
): CalendarEventWithRelations {
  return {
    id: "evt-1",
    user_id: "u1",
    title: "Treino",
    description: null,
    event_type: "workout",
    start_datetime: "2026-07-06T12:00:00.000Z",
    end_datetime: null,
    status: "planned",
    priority: "medium",
    related_task_id: null,
    related_project_id: null,
    related_content_id: null,
    related_document_id: null,
    is_recurring: true,
    recurrence_rule: null,
    notes: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("parseWeeklyRule", () => {
  it("parses a valid weekly rule into sorted, deduped weekday numbers", () => {
    expect(parseWeeklyRule("weekly:5,1,3,1")).toEqual([1, 3, 5]);
  });

  it("returns null for null/empty/invalid input", () => {
    expect(parseWeeklyRule(null)).toBeNull();
    expect(parseWeeklyRule("")).toBeNull();
    expect(parseWeeklyRule("daily")).toBeNull();
    expect(parseWeeklyRule("weekly:7")).toBeNull();
  });
});

describe("buildWeeklyRule", () => {
  it("serializes weekdays sorted and deduped", () => {
    expect(buildWeeklyRule([5, 1, 3, 1])).toBe("weekly:1,3,5");
  });

  it("round-trips with parseWeeklyRule", () => {
    expect(parseWeeklyRule(buildWeeklyRule([3, 0, 6]))).toEqual([0, 3, 6]);
  });
});

describe("describeRecurrenceRule", () => {
  it("describes every day", () => {
    expect(describeRecurrenceRule("weekly:0,1,2,3,4,5,6")).toBe("Todos os dias");
  });

  it("describes weekdays (seg–sex)", () => {
    expect(describeRecurrenceRule("weekly:1,2,3,4,5")).toBe(
      "Toda semana (seg–sex)",
    );
  });

  it("lists specific short weekday labels", () => {
    expect(describeRecurrenceRule("weekly:1,3")).toBe("Toda semana · Seg, Qua");
  });

  it("returns empty string for null", () => {
    expect(describeRecurrenceRule(null)).toBe("");
  });
});

describe("expandRecurringEvent", () => {
  it("expands a weekly rule into the matching occurrences within range", () => {
    // Anchor Mon 2026-07-06 12:00Z; rule Mon/Wed/Fri; range that whole week.
    const event = makeEvent({ recurrence_rule: "weekly:1,3,5" });
    const occurrences = expandRecurringEvent(
      event,
      new Date("2026-07-06T00:00:00.000Z"),
      new Date("2026-07-12T23:59:59.999Z"),
    );

    expect(occurrences.map((o) => o.start_datetime)).toEqual([
      "2026-07-06T12:00:00.000Z", // Mon
      "2026-07-08T12:00:00.000Z", // Wed
      "2026-07-10T12:00:00.000Z", // Fri
    ]);
  });

  it("gives each occurrence a unique occurrence_key but keeps the anchor id", () => {
    const event = makeEvent({ recurrence_rule: "weekly:1,3,5" });
    const occurrences = expandRecurringEvent(
      event,
      new Date("2026-07-06T00:00:00.000Z"),
      new Date("2026-07-12T23:59:59.999Z"),
    );
    const keys = occurrences.map((o) => o.occurrence_key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(occurrences.every((o) => o.id === "evt-1")).toBe(true);
  });

  it("preserves the anchor's duration on each occurrence", () => {
    const event = makeEvent({
      recurrence_rule: "weekly:3",
      start_datetime: "2026-07-08T12:00:00.000Z",
      end_datetime: "2026-07-08T13:00:00.000Z",
    });
    const [occ] = expandRecurringEvent(
      event,
      new Date("2026-07-08T00:00:00.000Z"),
      new Date("2026-07-08T23:59:59.999Z"),
    );
    const duration =
      new Date(occ.end_datetime!).getTime() -
      new Date(occ.start_datetime).getTime();
    expect(duration).toBe(60 * 60 * 1000);
  });

  it("falls back to the anchor when the rule is unparseable and it lands in range", () => {
    const event = makeEvent({
      recurrence_rule: null,
      start_datetime: "2026-07-08T12:00:00.000Z",
    });
    const inRange = expandRecurringEvent(
      event,
      new Date("2026-07-08T00:00:00.000Z"),
      new Date("2026-07-08T23:59:59.999Z"),
    );
    expect(inRange).toEqual([event]);

    const outOfRange = expandRecurringEvent(
      event,
      new Date("2026-07-09T00:00:00.000Z"),
      new Date("2026-07-09T23:59:59.999Z"),
    );
    expect(outOfRange).toEqual([]);
  });
});
