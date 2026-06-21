"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { logWorkout } from "@/lib/workouts/actions";
import { WEEKDAY_NAMES } from "@/lib/workouts/types";
import type { WorkoutDay, WorkoutLog } from "@/lib/workouts/types";

type Plan = {
  id: string;
  name: string;
  days: WorkoutDay[];
};

type Props = {
  plan: Plan | null;
  logs: WorkoutLog[];
  todayWorkout: WorkoutDay | null;
  todayLog: WorkoutLog | null;
};

export function WorkoutsView({ plan, logs, todayWorkout, todayLog }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [energy, setEnergy] = useState(3);
  const [pain, setPain] = useState(0);
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");

  function handleLog(status: string) {
    start(async () => {
      await logWorkout({
        workout_day_id: todayWorkout?.id,
        status,
        energy_level: energy,
        pain_level: pain,
        total_duration_minutes: duration ? parseInt(duration) : undefined,
        notes: notes || undefined,
        exercises: todayWorkout?.exercises?.map((e) => ({
          exercise_name: e.exercise_name,
          sets: e.sets ?? undefined,
          reps: e.reps ?? undefined,
          weight: e.weight ? Number(e.weight) : undefined,
        })),
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Treinos</h2>
        <p className="text-sm text-muted-foreground">{plan?.name ?? "Sem plano ativo"}</p>
      </div>

      <Card className={todayLog?.status === "completed" ? "border-teal/30 bg-teal/5" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="h-4 w-4 text-teal-text" />
            Treino de hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayWorkout ? (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{todayWorkout.title}</p>
                <p className="text-sm text-muted-foreground">{todayWorkout.description}</p>
              </div>
              {todayWorkout.exercises && todayWorkout.exercises.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {todayWorkout.exercises.map((e) => (
                    <li key={e.id} className="flex justify-between">
                      <span>{e.exercise_name}</span>
                      <span className="text-muted-foreground">
                        {e.sets}x{e.reps} {e.weight ? `@ ${e.weight}kg` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {!todayLog || todayLog.status !== "completed" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Energia (1-5)</Label><Input type="number" min={1} max={5} value={energy} onChange={(e) => setEnergy(+e.target.value)} /></div>
                  <div><Label>Dor (0-5)</Label><Input type="number" min={0} max={5} value={pain} onChange={(e) => setPain(+e.target.value)} /></div>
                  <div><Label>Duração (min)</Label><Input value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
                </div>
              ) : null}
              <Textarea placeholder="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              <div className="flex gap-2">
                {todayLog?.status === "completed" ? (
                  <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Feito hoje</Badge>
                ) : (
                  <>
                    <Button onClick={() => handleLog("completed")} disabled={pending}>Marcar como feito</Button>
                    <Button variant="outline" onClick={() => handleLog("skipped")} disabled={pending}>Pular</Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Descanso ou sem treino planejado para hoje.</p>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 font-heading font-semibold">Semana</h3>
        <div className="grid gap-2 sm:grid-cols-7">
          {WEEKDAY_NAMES.map((name, i) => {
            const day = plan?.days.find((d) => d.day_of_week === i);
            const isToday = new Date().getDay() === i;
            return (
              <div key={name} className={`rounded-lg border p-3 text-center text-sm ${isToday ? "border-teal bg-teal/5" : "border-border"}`}>
                <p className="text-xs text-muted-foreground">{name}</p>
                <p className="mt-1 font-medium">{day?.title ?? "—"}</p>
              </div>
            );
          })}
        </div>
      </div>

      {logs.length > 0 && (
        <div>
          <h3 className="mb-3 font-heading font-semibold">Histórico recente</h3>
          <ul className="space-y-2">
            {logs.slice(0, 5).map((l) => (
              <li key={l.id} className="flex justify-between rounded-lg border border-border p-3 text-sm">
                <span>{l.log_date}</span>
                <Badge variant={l.status === "completed" ? "success" : "secondary"}>{l.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
