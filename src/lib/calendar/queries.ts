import "server-only";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { expandRecurringEvent } from "./recurrence";
import type { CalendarEventWithRelations } from "./types";

function mapEventRow(row: Record<string, unknown>): CalendarEventWithRelations {
  const {
    tasks,
    projects,
    content_items,
    documents,
    ...event
  } = row as CalendarEventWithRelations & {
    tasks: CalendarEventWithRelations["task"];
    projects: CalendarEventWithRelations["project"];
    content_items: CalendarEventWithRelations["content"];
    documents: CalendarEventWithRelations["document"];
  };

  return {
    ...(event as CalendarEventWithRelations),
    task: tasks ?? null,
    project: projects ?? null,
    content: content_items ?? null,
    document: documents ?? null,
  };
}

const EVENT_SELECT = `
  *,
  tasks(id, title, status),
  projects(id, name),
  content_items(id, title, script_url, script_text),
  documents(id, title, url, content, document_type)
`;

export async function getEventsInRange(
  start: Date,
  end: Date,
): Promise<CalendarEventWithRelations[]> {
  const supabase = createServerSupabaseClient();

  // Non-recurring events are matched directly by their start_datetime.
  const singlePromise = supabase
    .from("calendar_events")
    .select(EVENT_SELECT)
    .eq("user_id", DEFAULT_USER_ID)
    .eq("is_recurring", false)
    .gte("start_datetime", start.toISOString())
    .lte("start_datetime", end.toISOString())
    .order("start_datetime");

  // Recurring anchors that have started on or before the end of the range are
  // expanded into concrete occurrences within [start, end].
  const recurringPromise = supabase
    .from("calendar_events")
    .select(EVENT_SELECT)
    .eq("user_id", DEFAULT_USER_ID)
    .eq("is_recurring", true)
    .lte("start_datetime", end.toISOString());

  const [single, recurring] = await Promise.all([
    singlePromise,
    recurringPromise,
  ]);

  if (single.error) throw new Error(single.error.message);
  if (recurring.error) throw new Error(recurring.error.message);

  const singles = (single.data ?? []).map((row) =>
    mapEventRow(row as Record<string, unknown>),
  );
  const expanded = (recurring.data ?? []).flatMap((row) =>
    expandRecurringEvent(
      mapEventRow(row as Record<string, unknown>),
      start,
      end,
    ),
  );

  return [...singles, ...expanded].sort(
    (a, b) =>
      new Date(a.start_datetime).getTime() -
      new Date(b.start_datetime).getTime(),
  );
}

export async function getMonthEvents(date: Date) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
  return getEventsInRange(start, end);
}

export async function getWeekEvents(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return getEventsInRange(start, end);
}

export async function getDayEvents(date: Date) {
  return getEventsInRange(startOfDay(date), endOfDay(date));
}

export async function getEventById(
  id: string,
): Promise<CalendarEventWithRelations | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("calendar_events")
    .select(EVENT_SELECT)
    .eq("id", id)
    .eq("user_id", DEFAULT_USER_ID)
    .single();

  if (error) return null;
  return mapEventRow(data as Record<string, unknown>);
}

export async function getTodayEvents(): Promise<CalendarEventWithRelations[]> {
  return getDayEvents(new Date());
}

export type DashboardCalendarStats = {
  todayEvents: CalendarEventWithRelations[];
  upcomingCount: number;
};

export async function getDashboardCalendarStats(): Promise<DashboardCalendarStats> {
  const todayEvents = await getTodayEvents();
  const upcoming = todayEvents.filter(
    (e) => e.status !== "completed" && e.status !== "cancelled",
  );

  return {
    todayEvents: upcoming.slice(0, 5),
    upcomingCount: upcoming.length,
  };
}

export async function getCalendarFormOptions() {
  const supabase = createServerSupabaseClient();

  const [tasks, projects, contents, documents] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title")
      .eq("user_id", DEFAULT_USER_ID)
      .neq("status", "done")
      .order("title"),
    supabase
      .from("projects")
      .select("id, name")
      .eq("user_id", DEFAULT_USER_ID)
      .in("status", ["planning", "active"])
      .order("name"),
    supabase
      .from("content_items")
      .select("id, title")
      .eq("user_id", DEFAULT_USER_ID)
      .not("status", "eq", "archived")
      .order("title"),
    supabase
      .from("documents")
      .select("id, title")
      .eq("user_id", DEFAULT_USER_ID)
      .order("title"),
  ]);

  return {
    tasks: (tasks.data ?? []).map((t) => ({ id: t.id, label: t.title })),
    projects: (projects.data ?? []).map((p) => ({
      id: p.id,
      label: p.name,
    })),
    contents: (contents.data ?? []).map((c) => ({
      id: c.id,
      label: c.title,
    })),
    documents: (documents.data ?? []).map((d) => ({
      id: d.id,
      label: d.title,
    })),
  };
}

export async function getEventsForApiRange(startStr: string, endStr: string) {
  return getEventsInRange(new Date(startStr), new Date(endStr));
}
