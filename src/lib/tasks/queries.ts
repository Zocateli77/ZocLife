import "server-only";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  ProjectOption,
  Task,
  TaskWithRelations,
} from "./types";
import { ACTIVE_STATUSES } from "./constants";

export async function getTasks(): Promise<TaskWithRelations[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      projects(id, name, status)
    `,
    )
    .eq("user_id", DEFAULT_USER_ID)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const { projects, ...task } = row as Task & {
      projects: ProjectOption | null;
    };
    return { ...task, project: projects ?? null } as TaskWithRelations;
  });
}

export async function getTaskById(id: string): Promise<TaskWithRelations | null> {
  const supabase = createServerSupabaseClient();

  const { data: task, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      projects(id, name, status)
    `,
    )
    .eq("id", id)
    .eq("user_id", DEFAULT_USER_ID)
    .single();

  if (error) return null;

  const { projects, ...taskData } = task as Task & {
    projects: ProjectOption | null;
  };

  const { data: checklist } = await supabase
    .from("task_checklist_items")
    .select("*")
    .eq("task_id", id)
    .order("order_index");

  const { data: activity } = await supabase
    .from("task_activity")
    .select("*")
    .eq("task_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    ...(taskData as Task),
    project: projects ?? null,
    checklist_items: checklist ?? [],
    activity: activity ?? [],
  };
}

export async function getProjectOptions(): Promise<ProjectOption[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id, name, status")
    .eq("user_id", DEFAULT_USER_ID)
    .in("status", ["planning", "active"])
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export type DashboardTaskStats = {
  todayTasks: TaskWithRelations[];
  overdueTasks: TaskWithRelations[];
  pendingCount: number;
  completedTodayCount: number;
  totalTodayCount: number;
  dayProgressPercent: number;
};

export async function getDashboardTaskStats(): Promise<DashboardTaskStats> {
  const tasks = await getTasks();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayStart = startOfDay(new Date());

  const todayTasks = tasks.filter(
    (t) =>
      t.status === "today" ||
      t.due_date === today ||
      (t.status === "in_progress" && t.due_date === today),
  );

  const overdueTasks = tasks.filter((t) => {
    if (t.status === "done" || !t.due_date) return false;
    return isBefore(parseISO(t.due_date), todayStart);
  });

  const pendingCount = tasks.filter((t) => ACTIVE_STATUSES.includes(t.status)).length;

  const completedToday = tasks.filter((t) => {
    if (!t.completed_at) return false;
    return t.completed_at.startsWith(today);
  });

  const totalTodayCount = todayTasks.length + completedToday.length;
  const completedTodayCount = completedToday.length;
  const dayProgressPercent =
    totalTodayCount > 0
      ? Math.round((completedTodayCount / totalTodayCount) * 100)
      : 0;

  return {
    todayTasks: todayTasks.filter((t) => t.status !== "done").slice(0, 5),
    overdueTasks: overdueTasks.slice(0, 5),
    pendingCount,
    completedTodayCount,
    totalTodayCount,
    dayProgressPercent,
  };
}
