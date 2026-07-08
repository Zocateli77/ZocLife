import { describe, it, expect } from "vitest";
import { buildDatetime, splitDatetime, formatEventTime } from "./utils";

// buildDatetime interprets the date/time as local wall-clock and stores UTC;
// splitDatetime/formatEventTime read it back in local time. The tests assert
// the round-trip (inverse) property, which holds in any timezone, so they are
// not flaky. The npm `test` script also pins TZ=America/Sao_Paulo.

describe("buildDatetime + splitDatetime round-trip", () => {
  it("preserves date and time through a round-trip", () => {
    const iso = buildDatetime("2026-07-08", "10:00");
    expect(splitDatetime(iso)).toEqual({ date: "2026-07-08", time: "10:00" });
  });

  it("defaults to 09:00 when no time is given", () => {
    const iso = buildDatetime("2026-07-08");
    expect(splitDatetime(iso)).toEqual({ date: "2026-07-08", time: "09:00" });
  });

  it("produces a valid ISO 8601 UTC string", () => {
    expect(buildDatetime("2026-07-08", "10:00")).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });
});

describe("splitDatetime — midnight (all-day) branch", () => {
  it("returns an empty time for a local-midnight instant", () => {
    const iso = buildDatetime("2026-07-08", "00:00");
    expect(splitDatetime(iso)).toEqual({ date: "2026-07-08", time: "" });
  });
});

describe("formatEventTime", () => {
  it("formats a timed event as HH:mm", () => {
    const iso = buildDatetime("2026-07-08", "14:30");
    expect(formatEventTime(iso)).toBe("14:30");
  });

  it("labels a local-midnight instant as 'Dia inteiro'", () => {
    const iso = buildDatetime("2026-07-08", "00:00");
    expect(formatEventTime(iso)).toBe("Dia inteiro");
  });
});
