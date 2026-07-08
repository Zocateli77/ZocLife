export const HABIT_FREQUENCIES = [
  "daily",
  "weekly",
  "monthly",
  "specific_days",
] as const;

export type HabitFrequency = (typeof HABIT_FREQUENCIES)[number];

export const HABIT_FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  specific_days: "Dias específicos",
};

export const HABIT_UNITS = [
  "minutes",
  "chapters",
  "pages",
  "liters",
  "workouts",
  "videos",
  "times",
  "hours",
] as const;

export type HabitUnit = (typeof HABIT_UNITS)[number];

export const HABIT_UNIT_LABELS: Record<HabitUnit, string> = {
  minutes: "minutos",
  chapters: "capítulos",
  pages: "páginas",
  liters: "litros",
  workouts: "treinos",
  videos: "vídeos",
  times: "vezes",
  hours: "horas",
};

export const HABIT_UNIT_STEPS: Record<HabitUnit, number> = {
  minutes: 5,
  hours: 0.5,
  liters: 0.1,
  pages: 1,
  chapters: 1,
  workouts: 1,
  videos: 1,
  times: 1,
};

export const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const HABIT_COLORS = [
  "#14B8A6",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#EF4444",
  "#10B981",
  "#EC4899",
];

export type HabitPeriod = "day" | "week" | "month";
