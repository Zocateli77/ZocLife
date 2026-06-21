"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/estudos");
}

export async function createBook(input: {
  title: string;
  author?: string;
  total_chapters?: number;
  daily_chapter_goal?: number;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("books")
    .insert({
      user_id: DEFAULT_USER_ID,
      title: input.title.trim(),
      author: input.author ?? null,
      total_chapters: input.total_chapters ?? null,
      daily_chapter_goal: input.daily_chapter_goal ?? 1,
      status: "reading",
      started_at: format(new Date(), "yyyy-MM-dd"),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidate();
  return data;
}

export async function logChapter(input: {
  book_id: string;
  chapter_number: number;
  chapter_title?: string;
  summary?: string;
  main_learning?: string;
  practical_ideas?: string;
  quotes?: string;
  application?: string;
  rating?: number;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("book_chapter_logs")
    .insert({
      book_id: input.book_id,
      user_id: DEFAULT_USER_ID,
      chapter_number: input.chapter_number,
      chapter_title: input.chapter_title ?? null,
      read_date: format(new Date(), "yyyy-MM-dd"),
      summary: input.summary ?? null,
      main_learning: input.main_learning ?? null,
      practical_ideas: input.practical_ideas ?? null,
      quotes: input.quotes ?? null,
      application: input.application ?? null,
      rating: input.rating ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await supabase
    .from("books")
    .update({ current_chapter: input.chapter_number })
    .eq("id", input.book_id);

  await supabase.from("scores").insert({
    user_id: DEFAULT_USER_ID,
    score_date: format(new Date(), "yyyy-MM-dd"),
    source_type: "reading",
    source_id: data.id,
    points: 10,
    description: "Capítulo lido",
  });

  revalidate();
  return data;
}

export async function completeBook(input: {
  book_id: string;
  summary?: string;
  top_learnings?: string;
  how_to_apply?: string;
  recommendation?: boolean;
  final_rating?: number;
  tags?: string[];
}) {
  const supabase = createServerSupabaseClient();
  await supabase
    .from("books")
    .update({
      status: "completed",
      finished_at: format(new Date(), "yyyy-MM-dd"),
      rating: input.final_rating ?? null,
    })
    .eq("id", input.book_id);

  await supabase.from("book_reviews").upsert({
    book_id: input.book_id,
    user_id: DEFAULT_USER_ID,
    summary: input.summary ?? null,
    top_learnings: input.top_learnings ?? null,
    how_to_apply: input.how_to_apply ?? null,
    recommendation: input.recommendation ?? null,
    final_rating: input.final_rating ?? null,
    tags: input.tags ?? [],
  });

  revalidate();
}
