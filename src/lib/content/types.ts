export const CONTENT_STATUSES = [
  "idea", "script", "ready_to_record", "recorded", "editing", "scheduled", "published", "archived",
] as const;

export const CONTENT_STATUS_LABELS: Record<string, string> = {
  idea: "Ideia",
  script: "Roteiro",
  ready_to_record: "Pronto para gravar",
  recorded: "Gravado",
  editing: "Editando",
  scheduled: "Agendado",
  published: "Publicado",
  archived: "Arquivado",
};

export const PLATFORMS = ["instagram", "tiktok", "youtube", "linkedin", "other"] as const;
export const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  other: "Outro",
};

export const CONTENT_TYPES = [
  "video", "carousel", "post", "reel", "story", "other",
] as const;
export const CONTENT_TYPE_LABELS: Record<string, string> = {
  video: "Vídeo",
  carousel: "Carrossel",
  post: "Post",
  reel: "Reel",
  story: "Story",
  other: "Outro",
};

export type ContentAttachment = {
  id: string;
  content_item_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export type ContentItem = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  platform: string;
  status: string;
  content_type: string;
  script_url: string | null;
  script_text: string | null;
  caption: string | null;
  cta: string | null;
  hashtags: string[];
  planned_date: string | null;
  recording_date: string | null;
  publish_date: string | null;
  final_url: string | null;
  tool: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  attachments?: ContentAttachment[];
};
