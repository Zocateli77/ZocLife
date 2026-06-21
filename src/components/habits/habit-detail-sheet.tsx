"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Flame, Trash2, TrendingUp } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { HabitForm } from "./habit-form";
import { deleteHabit } from "@/lib/habits/actions";
import {
  HABIT_FREQUENCY_LABELS,
  HABIT_UNIT_LABELS,
  type HabitUnit,
} from "@/lib/habits/constants";
import { formatHabitTarget, isLogComplete } from "@/lib/habits/stats";
import type { Habit, HabitLog } from "@/lib/habits/types";

type HabitDetail = Habit & {
  logs: HabitLog[];
  stats: { currentStreak: number; bestStreak: number; adherencePercent: number; completedInPeriod: number; expectedInPeriod: number };
  weekStats: { completedInPeriod: number; expectedInPeriod: number; adherencePercent: number };
};

type HabitDetailSheetProps = {
  habit: HabitDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HabitDetailSheet({
  habit,
  open,
  onOpenChange,
}: HabitDetailSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!habit) return null;

  function handleDelete() {
    startTransition(async () => {
      await deleteHabit(habit!.id);
      router.refresh();
      onOpenChange(false);
    });
  }

  const recentLogs = habit.logs.slice(0, 14);

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) setEditing(false);
        onOpenChange(v);
      }}
      title={editing ? "Editar hábito" : habit.name}
      description={
        editing
          ? "Atualize as configurações"
          : HABIT_FREQUENCY_LABELS[habit.frequency]
      }
    >
      {editing ? (
        <HabitForm
          habit={habit}
          mode="full"
          onSuccess={() => {
            setEditing(false);
            onOpenChange(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="space-y-5">
          {habit.description && (
            <p className="text-sm text-muted-foreground">{habit.description}</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <Flame className="mx-auto mb-1 h-4 w-4 text-amber" />
              <p className="font-heading text-xl font-bold">
                {habit.stats.currentStreak}
              </p>
              <p className="text-[10px] text-muted-foreground">Sequência</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <TrendingUp className="mx-auto mb-1 h-4 w-4 text-teal-text" />
              <p className="font-heading text-xl font-bold">
                {habit.stats.bestStreak}
              </p>
              <p className="text-[10px] text-muted-foreground">Melhor</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className="font-heading text-xl font-bold text-teal-text">
                {habit.stats.adherencePercent}%
              </p>
              <p className="text-[10px] text-muted-foreground">Mês</p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Meta: {formatHabitTarget(habit)}</span>
              <span className="text-muted-foreground">
                Semana: {habit.weekStats.completedInPeriod}/
                {habit.weekStats.expectedInPeriod}
              </span>
            </div>
            <Progress value={habit.weekStats.adherencePercent} />
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium">Histórico recente</p>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum registro ainda.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {recentLogs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {format(parseISO(log.log_date), "dd MMM", {
                        locale: ptBR,
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      {log.value != null && (
                        <span>
                          {log.value}{" "}
                          {HABIT_UNIT_LABELS[habit.target_unit as HabitUnit] ??
                            habit.target_unit}
                        </span>
                      )}
                      <Badge
                        variant={
                          isLogComplete(habit, log) ? "success" : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {isLogComplete(habit, log) ? "Feito" : "Parcial"}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setEditing(true)}>
              Editar
            </Button>
            <Button
              variant="ghost"
              className="text-danger hover:text-danger"
              onClick={() => setConfirmOpen(true)}
              disabled={isPending}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Excluir
            </Button>
          </div>

          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            onConfirm={handleDelete}
            title="Excluir este hábito?"
            description="O hábito e todo o histórico de registros serão removidos permanentemente."
            confirmLabel="Excluir"
            destructive
          />
        </div>
      )}
    </Sheet>
  );
}
