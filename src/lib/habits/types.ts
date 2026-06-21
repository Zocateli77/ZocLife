import type { HabitFrequency } from "./constants";

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  frequency_days: number[];
  target_value: number | null;
  target_unit: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string;
  value: number | null;
  is_completed: boolean;
  notes: string | null;
  created_at: string;
};

export type HabitStats = {
  currentStreak: number;
  bestStreak: number;
  adherencePercent: number;
  completedInPeriod: number;
  expectedInPeriod: number;
};

export type HabitWithStats = Habit & {
  todayLog?: HabitLog | null;
  stats: HabitStats;
  isDueToday: boolean;
  todayProgress: number;
};

export type CreateHabitInput = {
  name: string;
  description?: string | null;
  frequency?: HabitFrequency;
  frequency_days?: number[];
  target_value?: number | null;
  target_unit?: string | null;
  color?: string;
};

export type UpdateHabitInput = Partial<CreateHabitInput> & {
  id: string;
  is_active?: boolean;
};

export type LogHabitInput = {
  habit_id: string;
  log_date?: string;
  value?: number | null;
  is_completed?: boolean;
  notes?: string | null;
};
