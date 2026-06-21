"use client";

import { CheckCircle2, Circle, Flame, TrendingUp } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toggleHabitToday, updateHabitLogValue } from "@/lib/habits/actions";
import { formatHabitTarget, isLogComplete } from "@/lib/habits/stats";
import { HABIT_UNIT_LABELS, type HabitUnit } from "@/lib/habits/constants";
import type { HabitWithStats } from "@/lib/habits/types";

type HabitCardProps = {
  habit: HabitWithStats;
  onClick?: () => void;
};

export function HabitCard({ habit, onClick }: HabitCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [valueInput, setValueInput] = useState(
    habit.todayLog?.value?.toString() ?? "",
  );

  const completed = isLogComplete(habit, habit.todayLog);
  const hasNumericTarget = habit.target_value != null;

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      await toggleHabitToday(habit.id);
      router.refresh();
    });
  }

  function handleValueSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const val = parseFloat(valueInput);
    if (isNaN(val)) return;
    startTransition(async () => {
      await updateHabitLogValue(habit.id, val);
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md",
        completed && "border-teal/30 bg-teal/5",
        !habit.isDueToday && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className="mt-0.5 shrink-0"
          aria-label={completed ? "Desmarcar" : "Marcar como feito"}
        >
          {completed ? (
            <CheckCircle2 className="h-6 w-6 text-teal-text" />
          ) : (
            <Circle className="h-6 w-6 text-muted-foreground" />
          )}
        </button>

        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={onClick}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            <p className="font-medium">{habit.name}</p>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Meta: {formatHabitTarget(habit)}
          </p>
        </button>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant="outline" className="gap-1 text-[10px]">
            <Flame className="h-3 w-3 text-amber" />
            {habit.stats.currentStreak}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {habit.stats.adherencePercent}% mês
          </span>
        </div>
      </div>

      {hasNumericTarget && (
        <div className="mt-3 space-y-2">
          <Progress value={habit.todayProgress} className="h-2" />
          <form
            onSubmit={handleValueSubmit}
            className="flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              type="number"
              min={0}
              step={habit.target_unit === "chapters" ? 1 : 5}
              placeholder={`0 / ${habit.target_value} ${HABIT_UNIT_LABELS[habit.target_unit as HabitUnit] ?? habit.target_unit}`}
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              className="h-8 text-sm"
            />
            <Button type="submit" size="sm" disabled={isPending}>
              OK
            </Button>
          </form>
        </div>
      )}

      {habit.stats.bestStreak > 0 && (
        <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          Melhor sequência: {habit.stats.bestStreak} dias
        </p>
      )}
    </div>
  );
}
