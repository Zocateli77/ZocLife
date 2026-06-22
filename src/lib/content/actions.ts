"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { format } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const ATTACHMENT_BUCKET = "content-attachments";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/conteudo");
  revalidatePath("/calendario");
}

export type ContentInput = {
  title: string;
  platform?: string;
  status?: string;
  content_type?: string;
  tool?: string | null;
  description?: string | null;
  script_url?: string | null;
  script_text?: string | null;
  caption?: string | null;
  cta?: string | null;
  hashtags?: string[];
  planned_date?: string | null;
  publish_date?: string | null;
  final_url?: string | null;
};

// Keeps a single calendar event in sync for a content item (recording or
// publishing), matching by the related_content_id + title prefix so repeated
// saves update instead of duplicating.
async function syncContentEvent(
  contentId: string,
  prefix: "Gravar" | "Publicar",
  title: string,
  date: string | null | undefined,
) {
  const supabase = createServerSupabaseClient();
  const fullTitle = `${prefix}: ${title}`;

  const { data: existing } = await supabase
    .from("calendar_events")
    .select("id")
    .eq("user_id", DEFAULT_USER_ID)
    .eq("related_content_id", contentId)
    .eq("event_type", "content")
    .like("title", `${prefix}:%`)
    .maybeSingle();

  if (!date) {
    if (existing) {
      await supabase.from("calendar_events").delete().eq("id", existing.id);
    }
    return;
  }

  const start = `${date}T10:00:00-03:00`;
  if (existing) {
    await supabase
      .from("calendar_events")
      .update({ title: fullTitle, start_datetime: start })
      .eq("id", existing.id);
  } else {
    await supabase.from("calendar_events").insert({
      user_id: DEFAULT_USER_ID,
      title: fullTitle,
      event_type: "content",
      start_datetime: start,
      related_content_id: contentId,
      status: "planned",
      priority: "medium",
    });
  }
}

function toRow(input: ContentInput): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.title !== undefined) row.title = input.title.trim();
  if (input.platform !== undefined) row.platform = input.platform;
  if (input.status !== undefined) row.status = input.status;
  if (input.content_type !== undefined) row.content_type = input.content_type;
  if (input.tool !== undefined) row.tool = input.tool || null;
  if (input.description !== undefined) row.description = input.description || null;
  if (input.script_url !== undefined) row.script_url = input.script_url || null;
  if (input.script_text !== undefined) row.script_text = input.script_text || null;
  if (input.caption !== undefined) row.caption = input.caption || null;
  if (input.cta !== undefined) row.cta = input.cta || null;
  if (input.hashtags !== undefined) row.hashtags = input.hashtags;
  if (input.planned_date !== undefined) row.planned_date = input.planned_date || null;
  if (input.publish_date !== undefined) row.publish_date = input.publish_date || null;
  if (input.final_url !== undefined) row.final_url = input.final_url || null;
  return row;
}

export async function createContentItem(input: ContentInput) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("content_items")
    .insert({
      user_id: DEFAULT_USER_ID,
      platform: "youtube",
      status: "idea",
      hashtags: [],
      ...toRow(input),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await syncContentEvent(data.id, "Gravar", data.title, input.planned_date);
  await syncContentEvent(data.id, "Publicar", data.title, input.publish_date);

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

export async function updateContentItem(id: string, input: ContentInput) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("content_items")
    .update(toRow(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (input.planned_date !== undefined) {
    await syncContentEvent(id, "Gravar", data.title, input.planned_date);
  }
  if (input.publish_date !== undefined) {
    await syncContentEvent(id, "Publicar", data.title, input.publish_date);
  }

  revalidate();
  return data;
}

export async function deleteContentItem(id: string) {
  const supabase = createServerSupabaseClient();

  // Remove stored files before the rows cascade away.
  const { data: attachments } = await supabase
    .from("content_attachments")
    .select("file_path")
    .eq("content_item_id", id);
  const paths = (attachments ?? []).map((a) => a.file_path);
  if (paths.length) {
    await supabase.storage.from(ATTACHMENT_BUCKET).remove(paths);
  }

  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate();
}

// ── Attachments ──

// Returns a signed URL the browser uploads the file to directly, so the file
// never passes through the Next server (avoids the Vercel body-size limit).
export async function createAttachmentUploadUrl(
  contentId: string,
  fileName: string,
) {
  const supabase = createServerSupabaseClient();
  const safeName = fileName.replace(/[^\w.\-]+/g, "_");
  const path = `${contentId}/${randomUUID()}-${safeName}`;
  const { data, error } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUploadUrl(path);
  if (error) throw new Error(error.message);
  return { path: data.path, token: data.token };
}

export async function recordAttachment(
  contentId: string,
  meta: { path: string; fileName: string; mimeType?: string; size?: number },
) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("content_attachments").insert({
    content_item_id: contentId,
    user_id: DEFAULT_USER_ID,
    file_name: meta.fileName,
    file_path: meta.path,
    mime_type: meta.mimeType ?? null,
    size_bytes: meta.size ?? null,
  });
  if (error) throw new Error(error.message);
  revalidate();
}

export async function getAttachmentSignedUrl(path: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(path, 3600);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function deleteContentAttachment(id: string) {
  const supabase = createServerSupabaseClient();
  const { data: row } = await supabase
    .from("content_attachments")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();

  if (row?.file_path) {
    await supabase.storage.from(ATTACHMENT_BUCKET).remove([row.file_path]);
  }
  const { error } = await supabase.from("content_attachments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate();
}
