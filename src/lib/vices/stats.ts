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
import type { Vice, ViceLog, ViceStats } from "./types";
import type { VicePeriod } from "./constants";

export function isWithinLimit(
  vice: Vice,
  log: ViceLog | null | undefined,
): boolean {
  if (!log) return true;
  return Number(log.value) <= Number(vice.limit_value);
}

export function isOverLimit(
  vice: Vice,
  log: ViceLog | null | undefined,
): boolean {
  if (!log) return false;
  return Number(log.value) > Number(vice.limit_value);
}

function getPeriodRange(period: VicePeriod, refDate: Date = new Date()) {
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

export function computeStreak(vice: Vice, logs: ViceLog[]): {
  current: number;
  best: number;
} {
  const withinDates = new Set(
    logs
      .filter((l) => isWithinLimit(vice, l))
      .map((l) => l.log_date),
  );

  if (withinDates.size === 0) return { current: 0, best: 0 };

  let best = 0;
  let run = 0;

  const sorted = [...withinDates].sort();
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

  let current = 0;
  let checkDate = new Date();
  const todayStr = format(checkDate, "yyyy-MM-dd");
  const todayLog = logs.find((l) => l.log_date === todayStr);

  if (todayLog && !isWithinLimit(vice, todayLog)) {
    return { current: 0, best };
  }

  if (!withinDates.has(todayStr)) {
    checkDate = subDays(checkDate, 1);
  }

  while (withinDates.has(format(checkDate, "yyyy-MM-dd"))) {
    current++;
    checkDate = subDays(checkDate, 1);
  }

  return { current, best };
}

export function computeViceStats(
  vice: Vice,
  logs: ViceLog[],
  period: VicePeriod = "month",
  refDate: Date = new Date(),
): ViceStats {
  const { start, end } = getPeriodRange(period, refDate);
  const periodLogs = logs.filter(
    (l) =>
      l.log_date >= format(start, "yyyy-MM-dd") &&
      l.log_date <= format(end, "yyyy-MM-dd"),
  );

  const logMap = new Map(periodLogs.map((l) => [l.log_date, l]));
  const days = eachDayOfInterval({ start, end });
  const daysWithLogs = days.filter((d) =>
    logMap.has(format(d, "yyyy-MM-dd")),
  );

  const daysWithinLimit = daysWithLogs.filter((d) => {
    const log = logMap.get(format(d, "yyyy-MM-dd"));
    return isWithinLimit(vice, log);
  }).length;

  const totalDays = daysWithLogs.length;
  const withinLimitPercent =
    totalDays > 0 ? Math.round((daysWithinLimit / totalDays) * 100) : 100;

  const { current, best } = computeStreak(vice, logs);

  const weekStart = startOfWeek(refDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(refDate, { weekStartsOn: 1 });
  const weekLogs = logs.filter(
    (l) =>
      l.log_date >= format(weekStart, "yyyy-MM-dd") &&
      l.log_date <= format(weekEnd, "yyyy-MM-dd"),
  );
  const weeklyAverage =
    weekLogs.length > 0
      ? Math.round(
          (weekLogs.reduce((s, l) => s + Number(l.value), 0) /
            weekLogs.length) *
            10,
        ) / 10
      : 0;

  return {
    currentStreak: current,
    bestStreak: best,
    withinLimitPercent,
    daysWithinLimit,
    totalDays,
    weeklyAverage,
  };
}

export function getTodayProgress(
  vice: Vice,
  log: ViceLog | null | undefined,
): number {
  if (!log || Number(log.value) === 0) return 0;
  const pct = Math.round(
    (Number(log.value) / Number(vice.limit_value)) * 100,
  );
  return Math.min(pct, 150);
}
