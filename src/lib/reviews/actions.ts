"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateWeeklySummary } from "./queries";

export async function saveWeeklyReview(input: {
  what_worked?: string;
  what_did_not_work?: string;
  biggest_win?: string;
  next_week_focus?: string;
  notes?: string;
}) {
  const summary = await generateWeeklySummary();
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("weekly_reviews")
    .insert({
      user_id: DEFAULT_USER_ID,
      week_start: summary.week_start,
      week_end: summary.week_end,
      completed_summary: `${summary.completed_tasks} tarefas, ${summary.workouts_done} treinos, ${summary.chapters_read} capítulos`,
      pending_summary: `${summary.pending_tasks} tarefas pendentes`,
      habits_summary: `${summary.habits_completed}/${summary.habits_total} hábitos`,
      workouts_summary: `${summary.workouts_done} treinos`,
      reading_summary: `${summary.chapters_read} capítulos`,
      content_summary: `${summary.content_produced} conteúdos`,
      what_worked: input.what_worked ?? null,
      what_did_not_work: input.what_did_not_work ?? null,
      biggest_win: input.biggest_win ?? null,
      next_week_focus: input.next_week_focus ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("scores").insert({
    user_id: DEFAULT_USER_ID,
    score_date: format(new Date(), "yyyy-MM-dd"),
    source_type: "review",
    source_id: data.id,
    points: 40,
    description: "Revisão semanal",
  });

  revalidatePath("/revisao");
  revalidatePath("/gamificacao");
  return data;
}
