"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CreateEventInput, UpdateEventInput } from "./types";
import type { EventStatus } from "./constants";

function revalidateCalendarPaths() {
  revalidatePath("/");
  revalidatePath("/calendario");
  revalidatePath("/meu-dia");
}

async function resolveDocumentId(input: {
  related_document_id?: string | null;
  new_document_title?: string | null;
  new_document_url?: string | null;
  title: string;
}): Promise<string | null> {
  if (input.related_document_id) return input.related_document_id;

  if (input.new_document_url?.trim()) {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from("documents")
      .insert({
        user_id: DEFAULT_USER_ID,
        title: input.new_document_title?.trim() || `Roteiro: ${input.title}`,
        url: input.new_document_url.trim(),
        document_type: "script",
      })
      .select("id")
      .single();
    return data?.id ?? null;
  }

  return null;
}

export async function createCalendarEvent(input: CreateEventInput) {
  const supabase = createServerSupabaseClient();

  const documentId = await resolveDocumentId({
    related_document_id: input.related_document_id,
    new_document_title: input.new_document_title,
    new_document_url: input.new_document_url,
    title: input.title,
  });

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      user_id: DEFAULT_USER_ID,
      title: input.title.trim(),
      description: input.description ?? null,
      event_type: input.event_type ?? "appointment",
      start_datetime: input.start_datetime,
      end_datetime: input.end_datetime ?? null,
      status: input.status ?? "planned",
      priority: input.priority ?? "medium",
      related_task_id: input.related_task_id ?? null,
      related_project_id: input.related_project_id ?? null,
      related_content_id: input.related_content_id ?? null,
      related_document_id: documentId,
      is_recurring: input.is_recurring ?? false,
      recurrence_rule: input.recurrence_rule ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidateCalendarPaths();
  return data;
}

export async function updateCalendarEvent(input: UpdateEventInput) {
  const supabase = createServerSupabaseClient();

  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description;
  if (input.event_type !== undefined) updates.event_type = input.event_type;
  if (input.start_datetime !== undefined)
    updates.start_datetime = input.start_datetime;
  if (input.end_datetime !== undefined) updates.end_datetime = input.end_datetime;
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.related_task_id !== undefined)
    updates.related_task_id = input.related_task_id;
  if (input.related_project_id !== undefined)
    updates.related_project_id = input.related_project_id;
  if (input.related_content_id !== undefined)
    updates.related_content_id = input.related_content_id;
  if (input.is_recurring !== undefined) updates.is_recurring = input.is_recurring;
  if (input.recurrence_rule !== undefined)
    updates.recurrence_rule = input.recurrence_rule;
  if (input.notes !== undefined) updates.notes = input.notes;

  if (
    input.new_document_url ||
    input.related_document_id !== undefined
  ) {
    const title = (input.title as string) ?? "Evento";
    updates.related_document_id = await resolveDocumentId({
      related_document_id: input.related_document_id,
      new_document_title: input.new_document_title,
      new_document_url: input.new_document_url,
      title,
    });
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .update(updates)
    .eq("id", input.id)
    .eq("user_id", DEFAULT_USER_ID)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidateCalendarPaths();
  return data;
}

export async function updateEventStatus(id: string, status: EventStatus) {
  return updateCalendarEvent({ id, status });
}

export async function deleteCalendarEvent(id: string) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("user_id", DEFAULT_USER_ID);

  if (error) throw new Error(error.message);

  revalidateCalendarPaths();
}

export async function fetchEventsInRange(start: string, end: string) {
  const { getEventsForApiRange } = await import("./queries");
  return getEventsForApiRange(start, end);
}
