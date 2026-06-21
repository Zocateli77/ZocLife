export type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  status: string;
  total_chapters: number | null;
  current_chapter: number;
  daily_chapter_goal: number;
  started_at: string | null;
  finished_at: string | null;
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BookChapterLog = {
  id: string;
  book_id: string;
  chapter_number: number;
  chapter_title: string | null;
  read_date: string;
  summary: string | null;
  main_learning: string | null;
  practical_ideas: string | null;
  quotes: string | null;
  application: string | null;
  rating: number | null;
};

export type BookReview = {
  id: string;
  book_id: string;
  summary: string | null;
  top_learnings: string | null;
  how_to_apply: string | null;
  recommendation: boolean | null;
  final_rating: number | null;
  tags: string[];
};

export const BOOK_STATUSES = ["want_to_read", "reading", "paused", "completed", "abandoned"] as const;
export const BOOK_STATUS_LABELS: Record<string, string> = {
  want_to_read: "Quero ler",
  reading: "Lendo",
  paused: "Pausado",
  completed: "Concluído",
  abandoned: "Abandonado",
};
