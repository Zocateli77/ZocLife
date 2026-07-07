"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CreateViceInput, LogViceInput, UpdateViceInput } from "./types";

function revalidateVicePaths() {
  revalidatePath("/vicios");
}

export async function createVice(input: CreateViceInput) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("vices")
    .insert({
      user_id: DEFAULT_USER_ID,
      name: input.name.trim(),
      description: input.description ?? null,
      limit_value: input.limit_value,
      limit_unit: input.limit_unit ?? "minutes",
      color: input.color ?? "#E85002",
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidateVicePaths();
  return data;
}

export async function updateVice(input: UpdateViceInput) {
  const supabase = createServerSupabaseClient();

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.description !== undefined) updates.description = input.description;
  if (input.limit_value !== undefined) updates.limit_value = input.limit_value;
  if (input.limit_unit !== undefined) updates.limit_unit = input.limit_unit;
  if (input.color !== undefined) updates.color = input.color;
  if (input.is_active !== undefined) updates.is_active = input.is_active;

  const { data, error } = await supabase
    .from("vices")
    .update(updates)
    .eq("id", input.id)
    .eq("user_id", DEFAULT_USER_ID)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidateVicePaths();
  return data;
}

export async function deleteVice(id: string) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("vices")
    .delete()
    .eq("id", id)
    .eq("user_id", DEFAULT_USER_ID);

  if (error) throw new Error(error.message);
  revalidateVicePaths();
}

export async function logVice(input: LogViceInput) {
  const supabase = createServerSupabaseClient();
  const logDate = input.log_date ?? format(new Date(), "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("vice_logs")
    .upsert(
      {
        vice_id: input.vice_id,
        user_id: DEFAULT_USER_ID,
        log_date: logDate,
        value: input.value,
        notes: input.notes ?? null,
      },
      { onConflict: "vice_id,log_date" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidateVicePaths();
  return data;
}

export async function updateViceLogValue(
  viceId: string,
  value: number,
  logDate?: string,
) {
  return logVice({
    vice_id: viceId,
    log_date: logDate,
    value,
  });
}
