import "server-only";
import { format } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  computeHabitStats,
  getTodayProgress,
  isHabitDueOnDate,
  isLogComplete,
} from "./stats";
import type { Habit, HabitLog, HabitWithStats } from "./types";
import type { HabitPeriod } from "./constants";

export async function getHabits(): Promise<Habit[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .order("created_at");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getHabitLogs(
  habitId?: string,
  since?: string,
): Promise<HabitLog[]> {
  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .order("log_date", { ascending: false });

  if (habitId) query = query.eq("habit_id", habitId);
  if (since) query = query.gte("log_date", since);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getHabitsWithStats(
  period: HabitPeriod = "month",
): Promise<HabitWithStats[]> {
  const habits = await getHabits();
  const activeHabits = habits.filter((h) => h.is_active);
  const since = format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
  const allLogs = await getHabitLogs(undefined, since);
  const today = format(new Date(), "yyyy-MM-dd");

  return activeHabits.map((habit) => {
    const habitLogs = allLogs.filter((l) => l.habit_id === habit.id);
    const todayLog = habitLogs.find((l) => l.log_date === today) ?? null;

    return {
      ...habit,
      todayLog,
      stats: computeHabitStats(habit, habitLogs, period),
      isDueToday: isHabitDueOnDate(habit, new Date()),
      todayProgress: getTodayProgress(habit, todayLog),
    };
  });
}

export async function getHabitById(id: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("id", id)
    .eq("user_id", DEFAULT_USER_ID)
    .single();

  if (error) return null;

  const logs = await getHabitLogs(id);
  const today = format(new Date(), "yyyy-MM-dd");
  const todayLog = logs.find((l) => l.log_date === today) ?? null;

  return {
    ...(data as Habit),
    logs,
    todayLog,
    stats: computeHabitStats(data as Habit, logs, "month"),
    weekStats: computeHabitStats(data as Habit, logs, "week"),
  };
}

export type DashboardHabitStats = {
  todayHabits: HabitWithStats[];
  completedToday: number;
  totalDueToday: number;
  bikeHabit: HabitWithStats | null;
  readingHabit: HabitWithStats | null;
};

export async function getDashboardHabitStats(): Promise<DashboardHabitStats> {
  const habits = await getHabitsWithStats("week");
  const dueToday = habits.filter((h) => h.isDueToday);
  const completedToday = dueToday.filter((h) =>
    isLogComplete(h, h.todayLog),
  ).length;

  const bikeHabit =
    habits.find(
      (h) =>
        h.name.toLowerCase().includes("bicicleta") ||
        h.name.toLowerCase().includes("bike"),
    ) ?? null;

  const readingHabit =
    habits.find(
      (h) =>
        h.name.toLowerCase().includes("leitura") ||
        h.name.toLowerCase().includes("ler") ||
        h.target_unit === "chapters",
    ) ?? null;

  return {
    todayHabits: dueToday.slice(0, 5),
    completedToday,
    totalDueToday: dueToday.length,
    bikeHabit,
    readingHabit,
  };
}
