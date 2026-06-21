import "server-only";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Book } from "./types";

export async function getBooks() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .order("updated_at", { ascending: false });
  return (data ?? []) as Book[];
}

export async function getBookById(id: string) {
  const supabase = createServerSupabaseClient();
  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();
  if (!book) return null;

  const { data: chapters } = await supabase
    .from("book_chapter_logs")
    .select("*")
    .eq("book_id", id)
    .order("chapter_number");

  const { data: review } = await supabase
    .from("book_reviews")
    .select("*")
    .eq("book_id", id)
    .maybeSingle();

  return { ...(book as Book), chapters: chapters ?? [], review };
}

export async function searchLearnings(query: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("book_chapter_logs")
    .select("*, books(title, author)")
    .eq("user_id", DEFAULT_USER_ID)
    .or(`summary.ilike.%${query}%,main_learning.ilike.%${query}%,quotes.ilike.%${query}%`);
  return data ?? [];
}

export async function getDashboardReadingStats() {
  const books = await getBooks();
  const reading = books.filter((b) => b.status === "reading");
  const primary = reading[0] ?? null;
  return { readingBooks: reading, primaryBook: primary };
}
