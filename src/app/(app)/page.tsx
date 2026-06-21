import {
  Calendar,
  CheckSquare,
  Dumbbell,
  BookOpen,
  Video,
  Target,
  Clock,
  Trophy,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DayProgress } from "@/components/dashboard/day-progress";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getDashboardTaskStats } from "@/lib/tasks/queries";
import { getDashboardCalendarStats } from "@/lib/calendar/queries";
import { getDashboardHabitStats } from "@/lib/habits/queries";
import { getDashboardWorkoutStats } from "@/lib/workouts/queries";
import { getDashboardReadingStats } from "@/lib/studies/queries";
import { getDashboardContentStats } from "@/lib/content/queries";
import { getGamificationStats } from "@/lib/gamification/queries";
import { formatEventTime } from "@/lib/calendar/utils";
import { isLogComplete } from "@/lib/habits/stats";

export default async function DashboardPage() {
  const [taskStats, calendarStats, habitStats, workoutStats, readingStats, contentStats, gameStats] =
    await Promise.all([
      getDashboardTaskStats(),
      getDashboardCalendarStats(),
      getDashboardHabitStats(),
      getDashboardWorkoutStats(),
      getDashboardReadingStats(),
      getDashboardContentStats(),
      getGamificationStats(),
    ]);

  const totalDayItems =
    taskStats.totalTodayCount +
    habitStats.totalDueToday +
    (workoutStats.todayWorkout ? 1 : 0);
  const completedDayItems =
    taskStats.completedTodayCount +
    habitStats.completedToday +
    (workoutStats.completed ? 1 : 0);
  const dayPercent =
    totalDayItems > 0
      ? Math.round((completedDayItems / totalDayItems) * 100)
      : taskStats.dayProgressPercent;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Painel · Hoje"
        title="Seu dia"
        description="Hoje é dia de executar com clareza."
        actions={
          <>
            {taskStats.overdueTasks.length > 0 && (
              <Badge variant="warning" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {taskStats.overdueTasks.length} atrasados
              </Badge>
            )}
            <Badge variant="success" className="gap-1">
              <Trophy className="h-3 w-3" />
              {completedDayItems} vitórias · {gameStats.weekScore} pts
            </Badge>
          </>
        }
      />

      <DayProgress
        percentage={dayPercent}
        completed={completedDayItems}
        total={totalDayItems}
      />

      <Eyebrow>Módulos do dia</Eyebrow>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardCard title="Hoje" description="Resumo geral do dia" icon={Calendar} accent="amber" badge={`${totalDayItems} itens`}>
          <ul className="space-y-2">
            {habitStats.todayHabits.slice(0, 2).map((h) => (
              <li key={h.id} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                <span className="truncate">{h.name}</span>
              </li>
            ))}
            {taskStats.todayTasks.slice(0, 2).map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                <span className="truncate">{t.title}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard
          title="Treino"
          description={workoutStats.todayWorkout?.title ?? "Sem treino hoje"}
          icon={Dumbbell}
          href="/treinos"
          badge={workoutStats.completed ? "Feito" : workoutStats.todayWorkout ? "Pendente" : "Descanso"}
          badgeVariant={workoutStats.completed ? "success" : "warning"}
        />

        <DashboardCard
          title="Hábitos"
          description="Metas diárias"
          icon={Target}
          href="/habitos"
          badge={`${habitStats.completedToday}/${habitStats.totalDueToday}`}
          badgeVariant={habitStats.completedToday === habitStats.totalDueToday && habitStats.totalDueToday > 0 ? "success" : "secondary"}
        >
          {habitStats.todayHabits.length > 0 && (
            <ul className="space-y-2">
              {habitStats.todayHabits.map((h) => (
                <li key={h.id} className="flex items-center gap-2 text-sm">
                  {isLogComplete(h, h.todayLog) ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-text" />
                  ) : (
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: h.color }} />
                  )}
                  <span className="truncate">{h.name}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard
          title="Leitura"
          description={readingStats.primaryBook?.title ?? "Nenhum livro ativo"}
          icon={BookOpen}
          href="/estudos"
          badge={
            habitStats.readingHabit
              ? `${habitStats.readingHabit.todayLog?.value ?? 0}/${habitStats.readingHabit.target_value} cap.`
              : "—"
          }
        />

        <DashboardCard
          title="Conteúdo"
          description="Para gravar ou publicar"
          icon={Video}
          href="/conteudo"
          badge={`${contentStats.todayItems.length} hoje`}
        >
          {contentStats.todayItems.length > 0 && (
            <ul className="space-y-1">
              {contentStats.todayItems.map((c) => (
                <li key={c.id} className="truncate text-sm">{c.title}</li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Tarefas" description="Próximas ações" icon={CheckSquare} href="/tarefas" badge={`${taskStats.pendingCount} pendentes`}>
          {taskStats.todayTasks.slice(0, 3).map((t) => (
            <li key={t.id} className="flex items-center gap-2 text-sm list-none">
              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{t.title}</span>
            </li>
          ))}
        </DashboardCard>

        <DashboardCard title="Compromissos" description="Calendário de hoje" icon={Clock} href="/calendario" badge={`${calendarStats.upcomingCount} eventos`}>
          {calendarStats.todayEvents.map((e) => (
            <li key={e.id} className="flex items-center gap-2 text-sm list-none">
              <span className="text-[10px] text-muted-foreground">{formatEventTime(e.start_datetime)}</span>
              <span className="truncate">{e.title}</span>
            </li>
          ))}
        </DashboardCard>

        <DashboardCard title="Vitórias do dia" description="Conquistas de hoje" icon={Trophy} badge={`${completedDayItems} feitos`} badgeVariant="success" href="/gamificacao">
          <p className="text-sm text-teal-text">Nível {gameStats.currentLevel} · {gameStats.weekScore} pts esta semana</p>
        </DashboardCard>
      </div>

      {taskStats.overdueTasks.length > 0 && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-danger">
            <AlertTriangle className="h-4 w-4" />
            Tarefas atrasadas
          </p>
          <ul className="space-y-1">
            {taskStats.overdueTasks.map((t) => (
              <li key={t.id} className="text-sm text-muted-foreground">{t.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
