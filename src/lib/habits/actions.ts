"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isLogComplete } from "./stats";
import type { CreateHabitInput, LogHabitInput, UpdateHabitInput } from "./types";

function revalidateHabitPaths() {
  revalidatePath("/");
  revalidatePath("/habitos");
}

export async function createHabit(input: CreateHabitInput) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: DEFAULT_USER_ID,
      name: input.name.trim(),
      description: input.description ?? null,
      frequency: input.frequency ?? "daily",
      frequency_days: input.frequency_days ?? [],
      target_value: input.target_value ?? null,
      target_unit: input.target_unit ?? null,
      color: input.color ?? "#14B8A6",
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidateHabitPaths();
  return data;
}

export async function updateHabit(input: UpdateHabitInput) {
  const supabase = createServerSupabaseClient();

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.description !== undefined) updates.description = input.description;
  if (input.frequency !== undefined) updates.frequency = input.frequency;
  if (input.frequency_days !== undefined)
    updates.frequency_days = input.frequency_days;
  if (input.target_value !== undefined) updates.target_value = input.target_value;
  if (input.target_unit !== undefined) updates.target_unit = input.target_unit;
  if (input.color !== undefined) updates.color = input.color;
  if (input.is_active !== undefined) updates.is_active = input.is_active;

  const { data, error } = await supabase
    .from("habits")
    .update(updates)
    .eq("id", input.id)
    .eq("user_id", DEFAULT_USER_ID)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidateHabitPaths();
  return data;
}

export async function deleteHabit(id: string) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", id)
    .eq("user_id", DEFAULT_USER_ID);

  if (error) throw new Error(error.message);
  revalidateHabitPaths();
}

export async function logHabit(input: LogHabitInput) {
  const supabase = createServerSupabaseClient();
  const logDate = input.log_date ?? format(new Date(), "yyyy-MM-dd");

  const { data: habit } = await supabase
    .from("habits")
    .select("target_value")
    .eq("id", input.habit_id)
    .single();

  if (!habit) throw new Error("Hábito não encontrado");

  let isCompleted = input.is_completed ?? false;
  if (habit.target_value && input.value != null) {
    isCompleted = Number(input.value) >= Number(habit.target_value);
  } else if (input.is_completed === undefined && input.value == null) {
    isCompleted = true;
  }

  const { data, error } = await supabase
    .from("habit_logs")
    .upsert(
      {
        habit_id: input.habit_id,
        user_id: DEFAULT_USER_ID,
        log_date: logDate,
        value: input.value ?? null,
        is_completed: isCompleted,
        notes: input.notes ?? null,
      },
      { onConflict: "habit_id,log_date" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (isCompleted) {
    await supabase.from("scores").insert({
      user_id: DEFAULT_USER_ID,
      score_date: logDate,
      source_type: "habit",
      source_id: input.habit_id,
      points: 10,
      description: "Hábito concluído",
    });
  }

  revalidateHabitPaths();
  return data;
}

export async function toggleHabitToday(habitId: string) {
  const supabase = createServerSupabaseClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: existing } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .eq("log_date", today)
    .maybeSingle();

  const { data: habit } = await supabase
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .single();

  if (!habit) throw new Error("Hábito não encontrado");

  if (existing && isLogComplete(habit, existing)) {
    return logHabit({
      habit_id: habitId,
      log_date: today,
      value: habit.target_value ? 0 : null,
      is_completed: false,
    });
  }

  return logHabit({
    habit_id: habitId,
    log_date: today,
    value: habit.target_value ? Number(habit.target_value) : null,
    is_completed: true,
  });
}

export async function updateHabitLogValue(
  habitId: string,
  value: number,
  logDate?: string,
) {
  return logHabit({
    habit_id: habitId,
    log_date: logDate,
    value,
  });
}
