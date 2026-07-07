import "server-only";
import { format } from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  computeViceStats,
  getTodayProgress,
  isOverLimit,
} from "./stats";
import type { Vice, ViceLog, ViceWithStats } from "./types";
import type { VicePeriod } from "./constants";

export async function getVices(): Promise<Vice[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vices")
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .order("created_at");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getViceLogs(
  viceId?: string,
  since?: string,
): Promise<ViceLog[]> {
  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("vice_logs")
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .order("log_date", { ascending: false });

  if (viceId) query = query.eq("vice_id", viceId);
  if (since) query = query.gte("log_date", since);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getVicesWithStats(
  period: VicePeriod = "month",
): Promise<ViceWithStats[]> {
  const vices = await getVices();
  const activeVices = vices.filter((v) => v.is_active);
  const since = format(
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    "yyyy-MM-dd",
  );
  const allLogs = await getViceLogs(undefined, since);
  const today = format(new Date(), "yyyy-MM-dd");

  return activeVices.map((vice) => {
    const viceLogs = allLogs.filter((l) => l.vice_id === vice.id);
    const todayLog = viceLogs.find((l) => l.log_date === today) ?? null;

    return {
      ...vice,
      todayLog,
      stats: computeViceStats(vice, viceLogs, period),
      todayProgress: getTodayProgress(vice, todayLog),
      isOverLimit: isOverLimit(vice, todayLog),
    };
  });
}

export async function getViceById(id: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vices")
    .select("*")
    .eq("id", id)
    .eq("user_id", DEFAULT_USER_ID)
    .single();

  if (error) return null;

  const logs = await getViceLogs(id);
  const today = format(new Date(), "yyyy-MM-dd");
  const todayLog = logs.find((l) => l.log_date === today) ?? null;

  return {
    ...(data as Vice),
    logs,
    todayLog,
    stats: computeViceStats(data as Vice, logs, "month"),
    weekStats: computeViceStats(data as Vice, logs, "week"),
  };
}
