import "server-only";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Project } from "./types";

export async function getProjects(): Promise<Project[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("projects")
    .select("*, tasks(id, title, status)")
    .eq("user_id", DEFAULT_USER_ID)
    .order("updated_at", { ascending: false });

  return (data ?? []).map((p) => {
    const tasks = (p.tasks ?? []) as Array<{ id: string; title: string; status: string }>;
    const done = tasks.filter((t) => t.status === "done").length;
    const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : Number(p.progress);
    return { ...(p as Project), tasks, task_count: tasks.length, done_count: done, progress };
  });
}

export async function getProjectById(id: string) {
  const projects = await getProjects();
  return projects.find((p) => p.id === id) ?? null;
}

export async function getDashboardProjectStats() {
  const projects = await getProjects();
  const active = projects.filter((p) => p.status === "active");
  return { activeProjects: active.slice(0, 3), total: active.length };
}
