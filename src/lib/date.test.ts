import { describe, it, expect } from "vitest";
import { getTodayInAppTz, appDayRange, APP_TIME_ZONE } from "./date";

// These helpers anchor everything to America/Sao_Paulo (UTC-3, no DST since
// 2019) using Intl with an explicit timeZone, so the assertions below are
// deterministic regardless of the machine/runner timezone.

describe("getTodayInAppTz", () => {
  it("uses the app timezone, not UTC (late-evening São Paulo is still 'today')", () => {
    // 02:00 UTC on Jul 8 is 23:00 on Jul 7 in São Paulo.
    const instant = new Date("2026-07-08T02:00:00.000Z");
    expect(getTodayInAppTz(instant)).toBe("2026-07-07");
  });

  it("returns the same calendar day during São Paulo daytime", () => {
    // 12:00 UTC on Jul 8 is 09:00 on Jul 8 in São Paulo.
    const instant = new Date("2026-07-08T12:00:00.000Z");
    expect(getTodayInAppTz(instant)).toBe("2026-07-08");
  });

  it("formats as YYYY-MM-DD", () => {
    expect(getTodayInAppTz(new Date("2026-01-05T15:00:00.000Z"))).toBe(
      "2026-01-05",
    );
  });

  it("exposes the expected timezone", () => {
    expect(APP_TIME_ZONE).toBe("America/Sao_Paulo");
  });
});

describe("appDayRange", () => {
  it("returns the UTC instants bounding a São Paulo calendar day", () => {
    const { startISO, endISO } = appDayRange("2026-07-08");
    // 00:00 SP (UTC-3) => 03:00Z; 23:59:59.999 SP => next day 02:59:59.999Z.
    expect(startISO).toBe("2026-07-08T03:00:00.000Z");
    expect(endISO).toBe("2026-07-09T02:59:59.999Z");
  });

  it("spans just under 24 hours (inclusive end)", () => {
    const { startISO, endISO } = appDayRange("2026-03-15");
    const ms = new Date(endISO).getTime() - new Date(startISO).getTime();
    expect(ms).toBe(24 * 60 * 60 * 1000 - 1);
  });

  it("start is strictly before end", () => {
    const { startISO, endISO } = appDayRange("2026-12-31");
    expect(new Date(startISO).getTime()).toBeLessThan(
      new Date(endISO).getTime(),
    );
  });
});
