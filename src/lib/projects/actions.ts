"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/projetos");
  revalidatePath("/tarefas");
}

export async function createProject(input: {
  name: string;
  description?: string;
  objective?: string;
  category?: string;
  priority?: string;
  due_date?: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: DEFAULT_USER_ID,
      name: input.name.trim(),
      description: input.description ?? null,
      objective: input.objective ?? null,
      category: input.category ?? "personal",
      priority: input.priority ?? "medium",
      status: "active",
      due_date: input.due_date ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidate();
  return data;
}

export async function updateProject(id: string, input: Record<string, unknown>) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("projects").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidate();
}

export async function syncProjectProgress(projectId: string) {
  const supabase = createServerSupabaseClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("status")
    .eq("project_id", projectId);
  if (!tasks?.length) return;
  const done = tasks.filter((t) => t.status === "done").length;
  const progress = Math.round((done / tasks.length) * 100);
  await supabase.from("projects").update({ progress }).eq("id", projectId);
  revalidate();
}

export async function deleteProject(id: string) {
  const supabase = createServerSupabaseClient();
  await supabase.from("projects").delete().eq("id", id);
  revalidate();
}
