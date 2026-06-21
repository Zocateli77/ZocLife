import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import type { Habit, HabitLog, HabitStats } from "./types";
import type { HabitPeriod } from "./constants";

export function isHabitDueOnDate(habit: Habit, date: Date): boolean {
  if (!habit.is_active) return false;

  switch (habit.frequency) {
    case "daily":
      return true;
    case "specific_days":
      return habit.frequency_days.includes(date.getDay());
    case "weekly":
    case "monthly":
      return true;
    default:
      return true;
  }
}

export function isLogComplete(habit: Habit, log: HabitLog | null | undefined): boolean {
  if (!log) return false;
  if (log.is_completed) return true;
  if (habit.target_value && log.value != null) {
    return Number(log.value) >= Number(habit.target_value);
  }
  return false;
}

function getPeriodRange(period: HabitPeriod, refDate: Date = new Date()) {
  if (period === "day") {
    const d = format(refDate, "yyyy-MM-dd");
    return { start: refDate, end: refDate, startStr: d, endStr: d };
  }
  if (period === "week") {
    const start = startOfWeek(refDate, { weekStartsOn: 1 });
    const end = endOfWeek(refDate, { weekStartsOn: 1 });
    return {
      start,
      end,
      startStr: format(start, "yyyy-MM-dd"),
      endStr: format(end, "yyyy-MM-dd"),
    };
  }
  const start = startOfMonth(refDate);
  const end = endOfMonth(refDate);
  return {
    start,
    end,
    startStr: format(start, "yyyy-MM-dd"),
    endStr: format(end, "yyyy-MM-dd"),
  };
}

function countExpectedDays(habit: Habit, start: Date, end: Date): number {
  const days = eachDayOfInterval({ start, end });
  return days.filter((d) => isHabitDueOnDate(habit, d)).length;
}

function countCompletedDays(
  habit: Habit,
  logs: HabitLog[],
  start: Date,
  end: Date,
): number {
  const logMap = new Map(logs.map((l) => [l.log_date, l]));
  const days = eachDayOfInterval({ start, end });
  return days.filter((d) => {
    if (!isHabitDueOnDate(habit, d)) return false;
    const log = logMap.get(format(d, "yyyy-MM-dd"));
    return isLogComplete(habit, log);
  }).length;
}

export function computeStreak(habit: Habit, logs: HabitLog[]): {
  current: number;
  best: number;
} {
  const completedDates = new Set(
    logs
      .filter((l) => isLogComplete(habit, l))
      .map((l) => l.log_date),
  );

  if (completedDates.size === 0) return { current: 0, best: 0 };

  let best = 0;
  let current = 0;
  let run = 0;

  const sorted = [...completedDates].sort();
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = parseISO(sorted[i - 1]);
      const curr = parseISO(sorted[i]);
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      );
      run = diffDays === 1 ? run + 1 : 1;
    }
    best = Math.max(best, run);
  }

  let checkDate = new Date();
  if (!completedDates.has(format(checkDate, "yyyy-MM-dd"))) {
    checkDate = subDays(checkDate, 1);
  }
  while (completedDates.has(format(checkDate, "yyyy-MM-dd"))) {
    current++;
    checkDate = subDays(checkDate, 1);
  }

  return { current, best };
}

export function computeHabitStats(
  habit: Habit,
  logs: HabitLog[],
  period: HabitPeriod = "month",
  refDate: Date = new Date(),
): HabitStats {
  const { start, end } = getPeriodRange(period, refDate);
  const periodLogs = logs.filter(
    (l) => l.log_date >= format(start, "yyyy-MM-dd") && l.log_date <= format(end, "yyyy-MM-dd"),
  );

  const expectedInPeriod = countExpectedDays(habit, start, end);
  const completedInPeriod = countCompletedDays(habit, periodLogs, start, end);
  const { current, best } = computeStreak(habit, logs);

  const adherencePercent =
    expectedInPeriod > 0
      ? Math.round((completedInPeriod / expectedInPeriod) * 100)
      : 0;

  return {
    currentStreak: current,
    bestStreak: best,
    adherencePercent,
    completedInPeriod,
    expectedInPeriod,
  };
}

export function getTodayProgress(habit: Habit, log: HabitLog | null | undefined): number {
  if (!log) return 0;
  if (isLogComplete(habit, log)) return 100;
  if (habit.target_value && log.value != null) {
    return Math.min(
      100,
      Math.round((Number(log.value) / Number(habit.target_value)) * 100),
    );
  }
  return 0;
}

export function formatHabitTarget(habit: Habit): string {
  if (!habit.target_value) return "Marcar como feito";
  const unit = habit.target_unit ?? "";
  return `${habit.target_value} ${unit}`.trim();
}
