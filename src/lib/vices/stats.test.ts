import { describe, it, expect } from "vitest";
import { format, subDays } from "date-fns";
import {
  isWithinLimit,
  isOverLimit,
  computeStreak,
  computeViceStats,
  getTodayProgress,
} from "./stats";
import type { Vice, ViceLog } from "./types";

function makeVice(overrides: Partial<Vice> = {}): Vice {
  return {
    id: "v1",
    user_id: "u1",
    name: "Celular",
    description: null,
    limit_value: 90,
    limit_unit: "minutes",
    color: "#EF4444",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeLog(log_date: string, value: number): ViceLog {
  return {
    id: `log-${log_date}`,
    vice_id: "v1",
    user_id: "u1",
    log_date,
    value,
    notes: null,
    created_at: `${log_date}T00:00:00.000Z`,
  };
}

describe("isWithinLimit / isOverLimit", () => {
  const vice = makeVice();

  it("treats a missing log as within limit", () => {
    expect(isWithinLimit(vice, null)).toBe(true);
    expect(isOverLimit(vice, null)).toBe(false);
  });

  it("is within limit at or below the value", () => {
    expect(isWithinLimit(vice, makeLog("2026-07-08", 90))).toBe(true);
    expect(isOverLimit(vice, makeLog("2026-07-08", 90))).toBe(false);
  });

  it("is over limit above the value", () => {
    expect(isWithinLimit(vice, makeLog("2026-07-08", 120))).toBe(false);
    expect(isOverLimit(vice, makeLog("2026-07-08", 120))).toBe(true);
  });
});

describe("getTodayProgress", () => {
  const vice = makeVice();

  it("is 0 with no log or a zero value", () => {
    expect(getTodayProgress(vice, null)).toBe(0);
    expect(getTodayProgress(vice, makeLog("2026-07-08", 0))).toBe(0);
  });

  it("is a percentage of the limit", () => {
    expect(getTodayProgress(vice, makeLog("2026-07-08", 45))).toBe(50);
  });

  it("caps at 150 when far over the limit", () => {
    expect(getTodayProgress(vice, makeLog("2026-07-08", 180))).toBe(150);
  });
});

describe("computeStreak", () => {
  it("counts the current run of days within the limit ending today", () => {
    const vice = makeVice();
    const today = new Date();
    const logs = [0, 1, 2].map((d) =>
      makeLog(format(subDays(today, d), "yyyy-MM-dd"), 30),
    );
    expect(computeStreak(vice, logs).current).toBe(3);
  });

  it("resets the current streak when today is over the limit", () => {
    const vice = makeVice();
    const today = new Date();
    const logs = [
      makeLog(format(today, "yyyy-MM-dd"), 200), // today, over limit
      makeLog(format(subDays(today, 1), "yyyy-MM-dd"), 30),
    ];
    expect(computeStreak(vice, logs).current).toBe(0);
  });

  it("returns zero streaks with no logs", () => {
    expect(computeStreak(makeVice(), [])).toEqual({ current: 0, best: 0 });
  });
});

describe("computeViceStats", () => {
  it("computes adherence and weekly average over the month period", () => {
    const vice = makeVice();
    const logs = [makeLog("2026-07-06", 60), makeLog("2026-07-07", 120)];
    const stats = computeViceStats(vice, logs, "month", new Date(2026, 6, 8));

    expect(stats.totalDays).toBe(2);
    expect(stats.daysWithinLimit).toBe(1);
    expect(stats.withinLimitPercent).toBe(50);
    expect(stats.weeklyAverage).toBe(90);
    expect(stats.bestStreak).toBe(1);
  });
});
