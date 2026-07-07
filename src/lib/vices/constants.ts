export const VICE_UNITS = ["minutes", "times", "hours"] as const;

export type ViceUnit = (typeof VICE_UNITS)[number];

export const VICE_UNIT_LABELS: Record<ViceUnit, string> = {
  minutes: "minutos",
  times: "vezes",
  hours: "horas",
};

export const VICE_COLORS = [
  "#E85002",
  "#C10801",
  "#F16001",
  "#646464",
  "#EF4444",
  "#8B5CF6",
  "#3B82F6",
];

export type VicePeriod = "day" | "week" | "month";

/** Format minutes as H:MM (e.g. 90 → "1:30") */
export function formatMinutesAsTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}min`;
  return `${h}:${String(m).padStart(2, "0")}`;
}

/** Parse H:MM or decimal hours into minutes */
export function parseTimeToMinutes(input: string, unit: ViceUnit): number {
  if (unit === "times") return parseFloat(input) || 0;
  if (unit === "hours") return (parseFloat(input) || 0) * 60;

  const trimmed = input.trim();
  if (trimmed.includes(":")) {
    const [h, m] = trimmed.split(":").map((s) => parseInt(s, 10) || 0);
    return h * 60 + m;
  }
  return parseFloat(trimmed) || 0;
}

export function formatViceLimit(
  limitValue: number,
  limitUnit: string | null,
): string {
  const unit = limitUnit ?? "minutes";
  if (unit === "minutes") {
    return `máx ${formatMinutesAsTime(Number(limitValue))}/dia`;
  }
  if (unit === "hours") {
    return `máx ${limitValue}h/dia`;
  }
  return `máx ${limitValue} ${VICE_UNIT_LABELS[unit as ViceUnit] ?? unit}/dia`;
}
