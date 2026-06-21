import "server-only";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getDashboardTaskStats } from "@/lib/tasks/queries";
import { getDashboardCalendarStats } from "@/lib/calendar/queries";
import { getDashboardHabitStats } from "@/lib/habits/queries";
import { getDashboardWorkoutStats } from "@/lib/workouts/queries";
import { getDashboardReadingStats } from "@/lib/studies/queries";
import { getDashboardContentStats } from "@/lib/content/queries";
import { getDashboardProjectStats } from "@/lib/projects/queries";

export type DailyBriefingData = {
  date: string;
  greeting: string;
  summary: {
    totalTasks: number;
    totalHabits: number;
    totalEvents: number;
    totalWorkouts: number;
    overdueTasks: number;
  };
  tasks: Array<{ title: string; priority: string }>;
  events: Array<{ title: string; time: string }>;
  habits: Array<{ name: string; done: boolean }>;
  workout: { title: string; done: boolean } | null;
  reading: { book: string; progress: string } | null;
  contentItems: Array<{ title: string; status: string }>;
  projects: Array<{ name: string; progress: number }>;
  overdue: Array<{ title: string }>;
  appUrl: string;
};

export async function collectDailyBriefingData(): Promise<DailyBriefingData> {
  const [tasks, calendar, habits, workout, reading, content, projects] =
    await Promise.all([
      getDashboardTaskStats(),
      getDashboardCalendarStats(),
      getDashboardHabitStats(),
      getDashboardWorkoutStats(),
      getDashboardReadingStats(),
      getDashboardContentStats(),
      getDashboardProjectStats(),
    ]);

  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia, Lucas." : hour < 18 ? "Boa tarde, Lucas." : "Boa noite, Lucas.";

  return {
    date: today,
    greeting,
    summary: {
      totalTasks: tasks.todayTasks.length,
      totalHabits: habits.totalDueToday,
      totalEvents: calendar.upcomingCount,
      totalWorkouts: workout.todayWorkout ? 1 : 0,
      overdueTasks: tasks.overdueTasks.length,
    },
    tasks: tasks.todayTasks.map((t) => ({ title: t.title, priority: t.priority })),
    events: calendar.todayEvents.map((e) => ({
      title: e.title,
      time: new Date(e.start_datetime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    })),
    habits: habits.todayHabits.map((h) => ({
      name: h.name,
      done: !!h.todayLog?.is_completed,
    })),
    workout: workout.todayWorkout
      ? { title: workout.todayWorkout.title, done: workout.completed }
      : null,
    reading: reading.primaryBook
      ? {
          book: reading.primaryBook.title,
          progress: `Cap. ${reading.primaryBook.current_chapter}/${reading.primaryBook.total_chapters ?? "?"}`,
        }
      : null,
    contentItems: content.todayItems.map((c) => ({ title: c.title, status: c.status })),
    projects: projects.activeProjects.map((p) => ({ name: p.name, progress: p.progress })),
    overdue: tasks.overdueTasks.map((t) => ({ title: t.title })),
    appUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  };
}
