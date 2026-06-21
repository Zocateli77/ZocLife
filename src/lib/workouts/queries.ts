import "server-only";
import { format } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { WorkoutDay, WorkoutLog, WorkoutPlan } from "./types";

export async function getActivePlan() {
  const supabase = createServerSupabaseClient();
  const { data: plan } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .eq("is_active", true)
    .maybeSingle();

  if (!plan) return null;

  const { data: days } = await supabase
    .from("workout_days")
    .select("*, workout_exercises(*)")
    .eq("workout_plan_id", plan.id)
    .order("day_of_week");

  const daysWithExercises = (days ?? []).map((d) => ({
    ...d,
    exercises: (d.workout_exercises ?? []).sort(
      (a: { order_index: number }, b: { order_index: number }) =>
        a.order_index - b.order_index,
    ),
  }));

  return { ...(plan as WorkoutPlan), days: daysWithExercises as WorkoutDay[] };
}

export async function getTodayWorkout() {
  const plan = await getActivePlan();
  if (!plan) return null;
  const dow = new Date().getDay();
  return plan.days.find((d) => d.day_of_week === dow) ?? null;
}

export async function getWorkoutLogs(limit = 30): Promise<WorkoutLog[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("workout_logs")
    .select("*, workout_exercise_logs(*)")
    .eq("user_id", DEFAULT_USER_ID)
    .order("log_date", { ascending: false })
    .limit(limit);
  return (data ?? []) as WorkoutLog[];
}

export async function getWeightProgress(exerciseName: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("workout_exercise_logs")
    .select("weight, created_at, workout_logs!inner(log_date, user_id)")
    .eq("exercise_name", exerciseName)
    .eq("workout_logs.user_id", DEFAULT_USER_ID)
    .not("weight", "is", null)
    .order("created_at")
    .limit(20);
  return (data ?? []).map((r) => {
    const log = r.workout_logs;
    const logDate = Array.isArray(log)
      ? log[0]?.log_date
      : (log as { log_date: string } | null)?.log_date;
    return {
      date: logDate ?? "",
      weight: Number(r.weight),
    };
  });
}

export async function getDashboardWorkoutStats() {
  const today = await getTodayWorkout();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const supabase = createServerSupabaseClient();
  const { data: todayLog } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .eq("log_date", todayStr)
    .maybeSingle();

  return { todayWorkout: today, todayLog, completed: todayLog?.status === "completed" };
}
