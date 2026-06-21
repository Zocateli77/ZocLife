"use client";

import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { HabitCard } from "./habit-card";
import { HabitForm } from "./habit-form";
import { HabitDetailSheet } from "./habit-detail-sheet";
import { isLogComplete } from "@/lib/habits/stats";
import type { HabitWithStats } from "@/lib/habits/types";

type HabitDetail = Awaited<
  ReturnType<typeof import("@/lib/habits/queries").getHabitById>
>;

type HabitsViewProps = {
  habits: HabitWithStats[];
};

export function HabitsView({ habits }: HabitsViewProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<HabitDetail>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const dueToday = habits.filter((h) => h.isDueToday);
  const completedToday = dueToday.filter((h) =>
    isLogComplete(h, h.todayLog),
  ).length;
  const dayPercent =
    dueToday.length > 0
      ? Math.round((completedToday / dueToday.length) * 100)
      : 0;

  async function handleHabitClick(habit: HabitWithStats) {
    setDetailOpen(true);
    try {
      const full = await fetch(`/api/habits/${habit.id}`).then((r) => r.json());
      if (full && !full.error) setSelectedHabit(full);
    } catch {
      setSelectedHabit(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Hábitos e Metas</h2>
          <p className="text-sm text-muted-foreground">
            {completedToday}/{dueToday.length} concluídos hoje
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Novo hábito
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-teal-text" />
            <span className="text-sm font-medium">Progresso de hoje</span>
          </div>
          <span className="font-heading text-lg font-bold text-teal-text">
            {dayPercent}%
          </span>
        </div>
        <Progress value={dayPercent} className="h-3" />
      </div>

      {habits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Target className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum hábito cadastrado. Crie o primeiro!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onClick={() => handleHabitClick(habit)}
            />
          ))}
        </div>
      )}

      <Sheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Novo hábito"
        description="Cadastro rápido — expanda para mais opções"
      >
        <HabitForm
          mode="quick"
          onSuccess={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      </Sheet>

      <HabitDetailSheet
        habit={selectedHabit}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
