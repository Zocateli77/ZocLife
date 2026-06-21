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
  notes: string | null;
  created_at: string;
  updated_at: string;
};
