import { getActivePlan, getWorkoutLogs, getDashboardWorkoutStats } from "@/lib/workouts/queries";
import { WorkoutsView } from "@/components/workouts/workouts-view";

export default async function TreinosPage() {
  const [plan, logs, stats] = await Promise.all([
    getActivePlan(),
    getWorkoutLogs(),
    getDashboardWorkoutStats(),
  ]);

  return (
    <WorkoutsView
      plan={plan}
      logs={logs}
      todayWorkout={stats.todayWorkout}
      todayLog={stats.todayLog}
    />
  );
}
