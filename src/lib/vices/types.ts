export type Vice = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  limit_value: number;
  limit_unit: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ViceLog = {
  id: string;
  vice_id: string;
  user_id: string;
  log_date: string;
  value: number;
  notes: string | null;
  created_at: string;
};

export type ViceStats = {
  currentStreak: number;
  bestStreak: number;
  withinLimitPercent: number;
  daysWithinLimit: number;
  totalDays: number;
  weeklyAverage: number;
};

export type ViceWithStats = Vice & {
  todayLog?: ViceLog | null;
  stats: ViceStats;
  todayProgress: number;
  isOverLimit: boolean;
};

export type CreateViceInput = {
  name: string;
  description?: string | null;
  limit_value: number;
  limit_unit?: string;
  color?: string;
};

export type UpdateViceInput = Partial<CreateViceInput> & {
  id: string;
  is_active?: boolean;
};

export type LogViceInput = {
  vice_id: string;
  log_date?: string;
  value: number;
  notes?: string | null;
};
