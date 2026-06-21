"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/treinos");
}

export async function logWorkout(input: {
  workout_day_id?: string | null;
  status: string;
  energy_level?: number;
  pain_level?: number;
  total_duration_minutes?: number;
  notes?: string;
  exercises?: Array<{
    exercise_name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration_minutes?: number;
  }>;
}) {
  const supabase = createServerSupabaseClient();
  const logDate = format(new Date(), "yyyy-MM-dd");

  const { data: log, error } = await supabase
    .from("workout_logs")
    .insert({
      user_id: DEFAULT_USER_ID,
      workout_day_id: input.workout_day_id ?? null,
      log_date: logDate,
      status: input.status,
      energy_level: input.energy_level ?? null,
      pain_level: input.pain_level ?? null,
      total_duration_minutes: input.total_duration_minutes ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (input.exercises?.length) {
    await supabase.from("workout_exercise_logs").insert(
      input.exercises.map((e) => ({ workout_log_id: log.id, ...e })),
    );
  }

  if (input.status === "completed") {
    await supabase.from("scores").insert({
      user_id: DEFAULT_USER_ID,
      score_date: logDate,
      source_type: "workout",
      source_id: log.id,
      points: 30,
      description: "Treino concluído",
    });
  }

  revalidate();
  return log;
}

export async function createWorkoutDay(input: {
  plan_id: string;
  day_of_week: number;
  title: string;
  workout_type?: string;
  exercises?: Array<{ name: string; sets?: number; reps?: number; weight?: number }>;
}) {
  const supabase = createServerSupabaseClient();
  const { data: day } = await supabase
    .from("workout_days")
    .insert({
      workout_plan_id: input.plan_id,
      day_of_week: input.day_of_week,
      title: input.title,
      workout_type: input.workout_type ?? "strength",
    })
    .select()
    .single();

  if (input.exercises?.length && day) {
    await supabase.from("workout_exercises").insert(
      input.exercises.map((e, i) => ({
        workout_day_id: day.id,
        exercise_name: e.name,
        sets: e.sets ?? null,
        reps: e.reps ?? null,
        weight: e.weight ?? null,
        order_index: i,
      })),
    );
  }
  revalidate();
}
