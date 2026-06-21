import "server-only";
import { format } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ContentItem } from "./types";

export async function getContentItems(): Promise<ContentItem[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("content_items")
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .neq("status", "archived")
    .order("updated_at", { ascending: false });
  return (data ?? []) as ContentItem[];
}

export async function getDashboardContentStats() {
  const items = await getContentItems();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayItems = items.filter(
    (i) => i.planned_date === today || i.recording_date === today,
  );
  return { todayItems, total: items.length };
}
