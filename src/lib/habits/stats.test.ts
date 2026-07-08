import { describe, it, expect } from "vitest";
import { format, subDays } from "date-fns";
import {
  isHabitDueOnDate,
  isLogComplete,
  computeStreak,
  computeHabitStats,
  getTodayProgress,
} from "./stats";
import type { Habit, HabitLog } from "./types";

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "h1",
    user_id: "u1",
    name: "Beber água",
    description: null,
    frequency: "daily",
    frequency_days: [],
    target_value: null,
    target_unit: null,
    color: "#14B8A6",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeLog(log_date: string, overrides: Partial<HabitLog> = {}): HabitLog {
  return {
    id: `log-${log_date}`,
    habit_id: "h1",
    user_id: "u1",
    log_date,
    value: null,
    is_completed: false,
    notes: null,
    created_at: `${log_date}T00:00:00.000Z`,
    ...overrides,
  };
}

describe("isHabitDueOnDate", () => {
  it("is always due for a daily habit", () => {
    expect(isHabitDueOnDate(makeHabit(), new Date(2026, 6, 8))).toBe(true);
  });

  it("is never due for an inactive habit", () => {
    expect(
      isHabitDueOnDate(makeHabit({ is_active: false }), new Date(2026, 6, 8)),
    ).toBe(false);
  });

  it("respects specific_days weekdays", () => {
    const habit = makeHabit({
      frequency: "specific_days",
      frequency_days: [1, 3, 5],
    });
    expect(isHabitDueOnDate(habit, new Date(2026, 6, 6))).toBe(true); // Monday
    expect(isHabitDueOnDate(habit, new Date(2026, 6, 7))).toBe(false); // Tuesday
  });
});

describe("isLogComplete", () => {
  it("is false with no log", () => {
    expect(isLogComplete(makeHabit(), null)).toBe(false);
  });

  it("is true when explicitly completed", () => {
    expect(isLogComplete(makeHabit(), makeLog("2026-07-08", { is_completed: true }))).toBe(
      true,
    );
  });

  it("is true when the logged value meets the target", () => {
    const habit = makeHabit({ target_value: 2, target_unit: "liters" });
    expect(isLogComplete(habit, makeLog("2026-07-08", { value: 2 }))).toBe(true);
    expect(isLogComplete(habit, makeLog("2026-07-08", { value: 1 }))).toBe(false);
  });
});

describe("getTodayProgress", () => {
  const habit = makeHabit({ target_value: 2, target_unit: "liters" });

  it("is 0 with no log", () => {
    expect(getTodayProgress(habit, null)).toBe(0);
  });

  it("is a partial percentage below target", () => {
    expect(getTodayProgress(habit, makeLog("2026-07-08", { value: 1 }))).toBe(50);
  });

  it("caps at 100 when at or above target", () => {
    expect(getTodayProgress(habit, makeLog("2026-07-08", { value: 4 }))).toBe(100);
  });
});

describe("computeStreak", () => {
  it("counts the best run of consecutive completed days", () => {
    const habit = makeHabit();
    const logs = [
      makeLog("2026-01-01", { is_completed: true }),
      makeLog("2026-01-02", { is_completed: true }),
      makeLog("2026-01-03", { is_completed: true }),
      makeLog("2026-01-10", { is_completed: true }), // gap breaks the run
    ];
    expect(computeStreak(habit, logs).best).toBe(3);
  });

  it("counts the current streak ending today", () => {
    const habit = makeHabit();
    const today = new Date();
    const logs = [0, 1, 2].map((d) =>
      makeLog(format(subDays(today, d), "yyyy-MM-dd"), { is_completed: true }),
    );
    expect(computeStreak(habit, logs).current).toBe(3);
  });

  it("returns zero streaks when nothing is completed", () => {
    expect(computeStreak(makeHabit(), [])).toEqual({ current: 0, best: 0 });
  });
});

describe("computeHabitStats", () => {
  it("computes adherence over the week period", () => {
    const habit = makeHabit();
    const logs = [
      makeLog("2026-07-06", { is_completed: true }),
      makeLog("2026-07-07", { is_completed: true }),
      makeLog("2026-07-08", { is_completed: true }),
    ];
    const stats = computeHabitStats(habit, logs, "week", new Date(2026, 6, 8));
    expect(stats.expectedInPeriod).toBe(7);
    expect(stats.completedInPeriod).toBe(3);
    expect(stats.adherencePercent).toBe(43);
    expect(stats.bestStreak).toBe(3);
  });
});
