"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/conteudo");
  revalidatePath("/calendario");
}

export async function createContentItem(input: {
  title: string;
  platform?: string;
  status?: string;
  script_url?: string;
  script_text?: string;
  planned_date?: string;
  caption?: string;
  hashtags?: string[];
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("content_items")
    .insert({
      user_id: DEFAULT_USER_ID,
      title: input.title.trim(),
      platform: input.platform ?? "youtube",
      status: input.status ?? "idea",
      script_url: input.script_url ?? null,
      script_text: input.script_text ?? null,
      planned_date: input.planned_date ?? null,
      caption: input.caption ?? null,
      hashtags: input.hashtags ?? [],
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (input.planned_date) {
    await supabase.from("calendar_events").insert({
      user_id: DEFAULT_USER_ID,
      title: `Gravar: ${input.title}`,
      event_type: "content",
      start_datetime: `${input.planned_date}T10:00:00.000Z`,
      related_content_id: data.id,
      status: "planned",
      priority: "medium",
    });
  }

  revalidate();
  return data;
}

export async function updateContentStatus(id: string, status: string) {
  const supabase = createServerSupabaseClient();
  const updates: Record<string, unknown> = { status };
  if (status === "recorded") updates.recording_date = format(new Date(), "yyyy-MM-dd");
  if (status === "published") updates.publish_date = format(new Date(), "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("content_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (status === "recorded") {
    await supabase.from("scores").insert({
      user_id: DEFAULT_USER_ID,
      score_date: format(new Date(), "yyyy-MM-dd"),
      source_type: "content",
      source_id: id,
      points: 50,
      description: "Conteúdo gravado",
    });
  }

  revalidate();
  return data;
}

export async function updateContentItem(id: string, input: Record<string, unknown>) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("content_items").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidate();
}
