"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CreateTaskInput, UpdateTaskInput } from "./types";
import type { TaskStatus } from "./constants";

async function logTaskActivity(
  taskId: string,
  action: string,
  fromStatus?: string | null,
  toStatus?: string | null,
  notes?: string,
) {
  const supabase = createServerSupabaseClient();
  await supabase.from("task_activity").insert({
    task_id: taskId,
    user_id: DEFAULT_USER_ID,
    action,
    from_status: fromStatus ?? null,
    to_status: toStatus ?? null,
    notes: notes ?? null,
  });
}

async function syncCalendarEvent(
  taskId: string,
  title: string,
  dueDate: string | null,
  description?: string | null,
) {
  const supabase = createServerSupabaseClient();

  if (!dueDate) {
    await supabase
      .from("calendar_events")
      .delete()
      .eq("related_task_id", taskId);
    return;
  }

  const startDatetime = `${dueDate}T09:00:00.000Z`;

  const { data: existing } = await supabase
    .from("calendar_events")
    .select("id")
    .eq("related_task_id", taskId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("calendar_events")
      .update({
        title,
        description,
        start_datetime: startDatetime,
        event_type: "task",
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("calendar_events").insert({
      user_id: DEFAULT_USER_ID,
      title,
      description,
      event_type: "task",
      start_datetime: startDatetime,
      related_task_id: taskId,
      status: "planned",
      priority: "medium",
    });
  }
}

function revalidateTaskPaths() {
  revalidatePath("/");
  revalidatePath("/tarefas");
  revalidatePath("/calendario");
}

export async function createTask(input: CreateTaskInput) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: DEFAULT_USER_ID,
      title: input.title.trim(),
      description: input.description ?? null,
      status: input.status ?? "backlog",
      priority: input.priority ?? "medium",
      category: input.category ?? "personal",
      project_id: input.project_id ?? null,
      due_date: input.due_date ?? null,
      start_date: input.start_date ?? null,
      estimated_minutes: input.estimated_minutes ?? null,
      tags: input.tags ?? [],
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (input.checklist?.length) {
    await supabase.from("task_checklist_items").insert(
      input.checklist.map((title, index) => ({
        task_id: data.id,
        title: title.trim(),
        order_index: index,
      })),
    );
  }

  await logTaskActivity(data.id, "created", null, data.status);

  if (input.sync_calendar !== false && input.due_date) {
    await syncCalendarEvent(
      data.id,
      data.title,
      input.due_date,
      input.description,
    );
  }

  revalidateTaskPaths();
  return data;
}

export async function updateTask(input: UpdateTaskInput) {
  const supabase = createServerSupabaseClient();

  const { data: current } = await supabase
    .from("tasks")
    .select("status, title, due_date, description")
    .eq("id", input.id)
    .eq("user_id", DEFAULT_USER_ID)
    .single();

  if (!current) throw new Error("Tarefa não encontrada");

  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description;
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.category !== undefined) updates.category = input.category;
  if (input.project_id !== undefined) updates.project_id = input.project_id;
  if (input.due_date !== undefined) updates.due_date = input.due_date;
  if (input.start_date !== undefined) updates.start_date = input.start_date;
  if (input.estimated_minutes !== undefined)
    updates.estimated_minutes = input.estimated_minutes;
  if (input.tags !== undefined) updates.tags = input.tags;
  if (input.notes !== undefined) updates.notes = input.notes;

  if (input.status === "done") {
    updates.completed_at = new Date().toISOString();
  } else if (input.status !== undefined) {
    updates.completed_at = null;
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", input.id)
    .eq("user_id", DEFAULT_USER_ID)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (input.status && input.status !== current.status) {
    await logTaskActivity(
      input.id,
      "status_changed",
      current.status,
      input.status,
    );
  } else {
    await logTaskActivity(input.id, "updated");
  }

  const dueDate =
    input.due_date !== undefined ? input.due_date : current.due_date;
  if (input.sync_calendar !== false) {
    await syncCalendarEvent(
      input.id,
      data.title,
      dueDate,
      data.description,
    );
  }

  if (input.status === "done" && data.project_id) {
    const { syncProjectProgress } = await import("@/lib/projects/actions");
    await syncProjectProgress(data.project_id as string);
  }

  revalidateTaskPaths();
  return data;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  return updateTask({ id: taskId, status });
}

export async function deleteTask(taskId: string) {
  const supabase = createServerSupabaseClient();

  await supabase
    .from("calendar_events")
    .delete()
    .eq("related_task_id", taskId);

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", DEFAULT_USER_ID);

  if (error) throw new Error(error.message);

  revalidateTaskPaths();
}

export async function toggleTaskComplete(taskId: string) {
  const supabase = createServerSupabaseClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("status")
    .eq("id", taskId)
    .single();

  if (!task) throw new Error("Tarefa não encontrada");

  const newStatus: TaskStatus = task.status === "done" ? "today" : "done";
  return updateTask({ id: taskId, status: newStatus });
}

export async function addChecklistItem(taskId: string, title: string) {
  const supabase = createServerSupabaseClient();

  const { data: items } = await supabase
    .from("task_checklist_items")
    .select("order_index")
    .eq("task_id", taskId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextIndex = (items?.[0]?.order_index ?? -1) + 1;

  const { error } = await supabase.from("task_checklist_items").insert({
    task_id: taskId,
    title: title.trim(),
    order_index: nextIndex,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/tarefas");
}

export async function toggleChecklistItem(itemId: string, isCompleted: boolean) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("task_checklist_items")
    .update({ is_completed: isCompleted })
    .eq("id", itemId);

  if (error) throw new Error(error.message);
  revalidatePath("/tarefas");
}

export async function createQuickTask(title: string, dueDate?: string) {
  const today = format(new Date(), "yyyy-MM-dd");
  return createTask({
    title,
    due_date: dueDate ?? today,
    status: dueDate === today || !dueDate ? "today" : "backlog",
    priority: "medium",
    sync_calendar: true,
  });
}
