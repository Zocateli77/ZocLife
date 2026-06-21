import "server-only";
import { format, startOfWeek, subWeeks } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type GamificationStats = {
  todayScore: number;
  weekScore: number;
  monthScore: number;
  bestWeekScore: number;
  currentLevel: number;
  levelProgress: number;
  streakDays: number;
  byCategory: Record<string, number>;
  recentScores: Array<{ points: number; description: string; score_date: string }>;
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 5000];

export async function getGamificationStats(): Promise<GamificationStats> {
  const supabase = createServerSupabaseClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");

  const { data: scores } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .order("created_at", { ascending: false })
    .limit(200);

  const all = scores ?? [];
  const sum = (filter: (s: { score_date: string }) => boolean) =>
    all.filter(filter).reduce((a, s) => a + s.points, 0);

  const todayScore = sum((s) => s.score_date === today);
  const weekScore = sum((s) => s.score_date >= weekStart);
  const monthScore = sum((s) => s.score_date >= monthStart);

  const byCategory: Record<string, number> = {};
  all.filter((s) => s.score_date >= monthStart).forEach((s) => {
    byCategory[s.source_type] = (byCategory[s.source_type] ?? 0) + s.points;
  });

  let bestWeekScore = 0;
  for (let i = 0; i < 8; i++) {
    const ws = format(startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const we = format(startOfWeek(subWeeks(new Date(), i - 1), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const wk = sum((s) => s.score_date >= ws && s.score_date < we);
    bestWeekScore = Math.max(bestWeekScore, wk);
  }

  const totalPoints = all.reduce((a, s) => a + s.points, 0);
  let currentLevel = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) {
      currentLevel = i + 1;
      break;
    }
  }
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const prevThreshold = LEVEL_THRESHOLDS[currentLevel - 1] ?? 0;
  const levelProgress = Math.round(
    ((totalPoints - prevThreshold) / (nextThreshold - prevThreshold)) * 100,
  );

  const { data: habits } = await supabase.from("habit_logs").select("log_date").eq("user_id", DEFAULT_USER_ID).eq("is_completed", true).order("log_date", { ascending: false }).limit(30);
  let streakDays = 0;
  const dates = new Set((habits ?? []).map((h) => h.log_date));
  const d = new Date();
  while (dates.has(format(d, "yyyy-MM-dd"))) {
    streakDays++;
    d.setDate(d.getDate() - 1);
  }

  return {
    todayScore,
    weekScore,
    monthScore,
    bestWeekScore,
    currentLevel,
    levelProgress: Math.min(100, levelProgress),
    streakDays,
    byCategory,
    recentScores: all.slice(0, 10).map((s) => ({
      points: s.points,
      description: s.description ?? s.source_type,
      score_date: s.score_date,
    })),
  };
}
