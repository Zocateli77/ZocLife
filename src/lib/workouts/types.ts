export type WorkoutPlan = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  is_active: boolean;
  created_at: string;
};

export type WorkoutDay = {
  id: string;
  workout_plan_id: string;
  day_of_week: number;
  title: string;
  description: string | null;
  workout_type: string;
  created_at: string;
  exercises?: WorkoutExercise[];
};

export type WorkoutExercise = {
  id: string;
  workout_day_id: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  duration_minutes: number | null;
  notes: string | null;
  order_index: number;
};

export type WorkoutLog = {
  id: string;
  user_id: string;
  workout_day_id: string | null;
  log_date: string;
  status: string;
  energy_level: number | null;
  pain_level: number | null;
  total_duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  exercise_logs?: WorkoutExerciseLog[];
};

export type WorkoutExerciseLog = {
  id: string;
  workout_log_id: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  duration_minutes: number | null;
  notes: string | null;
};

export const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
