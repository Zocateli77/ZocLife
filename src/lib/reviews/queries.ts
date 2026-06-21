import "server-only";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getHabitsWithStats } from "@/lib/habits/queries";
import { getTasks } from "@/lib/tasks/queries";
import { getWorkoutLogs } from "@/lib/workouts/queries";
import { getContentItems } from "@/lib/content/queries";
import { ACTIVE_STATUSES } from "@/lib/tasks/constants";
import { isLogComplete } from "@/lib/habits/stats";

export type WeeklySummary = {
  week_start: string;
  week_end: string;
  completed_tasks: number;
  pending_tasks: number;
  habits_completed: number;
  habits_total: number;
  workouts_done: number;
  chapters_read: number;
  content_produced: number;
};

export async function generateWeeklySummary(): Promise<WeeklySummary> {
  const now = new Date();
  const ws = startOfWeek(now, { weekStartsOn: 1 });
  const we = endOfWeek(now, { weekStartsOn: 1 });
  const wsStr = format(ws, "yyyy-MM-dd");
  const weStr = format(we, "yyyy-MM-dd");

  const [tasks, habits, logs, content] = await Promise.all([
    getTasks(),
    getHabitsWithStats("week"),
    getWorkoutLogs(7),
    getContentItems(),
  ]);

  const weekTasks = tasks.filter((t) => t.status === "done" && t.completed_at && t.completed_at >= wsStr);
  const pending = tasks.filter((t) => ACTIVE_STATUSES.includes(t.status));
  const habitsDone = habits.filter((h) => isLogComplete(h, h.todayLog)).length;

  const supabase = createServerSupabaseClient();
  const { count: chapters } = await supabase
    .from("book_chapter_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", DEFAULT_USER_ID)
    .gte("read_date", wsStr)
    .lte("read_date", weStr);

  const contentProduced = content.filter(
    (c) => c.recording_date && c.recording_date >= wsStr && c.recording_date <= weStr,
  ).length;

  return {
    week_start: wsStr,
    week_end: weStr,
    completed_tasks: weekTasks.length,
    pending_tasks: pending.length,
    habits_completed: habitsDone,
    habits_total: habits.length,
    workouts_done: logs.filter((l) => l.status === "completed").length,
    chapters_read: chapters ?? 0,
    content_produced: contentProduced,
  };
}

export async function getWeeklyReviews() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .order("week_start", { ascending: false })
    .limit(12);
  return data ?? [];
}
