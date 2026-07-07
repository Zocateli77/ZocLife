"use client";

import { AlertTriangle, ShieldCheck, TrendingDown } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { updateViceLogValue } from "@/lib/vices/actions";
import {
  formatMinutesAsTime,
  formatViceLimit,
  VICE_UNIT_LABELS,
  type ViceUnit,
} from "@/lib/vices/constants";
import type { ViceWithStats } from "@/lib/vices/types";

type ViceCardProps = {
  vice: ViceWithStats;
  onClick?: () => void;
};

export function ViceCard({ vice, onClick }: ViceCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [valueInput, setValueInput] = useState(
    vice.todayLog?.value?.toString() ?? "",
  );

  const used = Number(vice.todayLog?.value ?? 0);
  const limit = Number(vice.limit_value);
  const overLimit = vice.isOverLimit;
  const withinLimit = !overLimit && used > 0;

  function formatUsedValue(val: number): string {
    if (vice.limit_unit === "minutes") return formatMinutesAsTime(val);
    const unit =
      VICE_UNIT_LABELS[vice.limit_unit as ViceUnit] ?? vice.limit_unit;
    return `${val} ${unit}`;
  }

  function handleValueSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const val = parseFloat(valueInput);
    if (isNaN(val) || val < 0) return;
    startTransition(async () => {
      await updateViceLogValue(vice.id, val);
      router.refresh();
    });
  }

  const progressPct = Math.min(vice.todayProgress, 100);
  const barColor = overLimit
    ? "bg-danger"
    : progressPct >= 80
      ? "bg-warning"
      : "bg-teal";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md",
        overLimit && "border-danger/40 bg-danger/5",
        withinLimit && "border-teal/30 bg-teal/5",
      )}
    >
      <button
        type="button"
        className="mb-3 w-full text-left"
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: vice.color }}
            />
            <p className="font-medium">{vice.name}</p>
          </div>
          <Badge
            variant={overLimit ? "danger" : "outline"}
            className="gap-1 text-[10px]"
          >
            {overLimit ? (
              <>
                <AlertTriangle className="h-3 w-3" />
                Excedeu
              </>
            ) : (
              <>
                <ShieldCheck className="h-3 w-3" />
                No limite
              </>
            )}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatViceLimit(vice.limit_value, vice.limit_unit)}
        </p>
      </button>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>
            Hoje: <strong>{formatUsedValue(used)}</strong>
          </span>
          <span className="text-muted-foreground">
            de{" "}
            {vice.limit_unit === "minutes"
              ? formatMinutesAsTime(limit)
              : `${limit} ${VICE_UNIT_LABELS[vice.limit_unit as ViceUnit] ?? vice.limit_unit}`}
          </span>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-500", barColor)}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <form onSubmit={handleValueSubmit} className="flex gap-2">
          <Input
            type="number"
            min={0}
            step={vice.limit_unit === "minutes" ? 5 : 1}
            placeholder={`Uso de hoje (${vice.limit_unit === "minutes" ? "min" : vice.limit_unit})`}
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" disabled={isPending}>
            OK
          </Button>
        </form>
      </div>

      <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <TrendingDown className="h-3 w-3" />
        {vice.stats.currentStreak} dia(s) no limite · média semanal{" "}
        {vice.stats.weeklyAverage}
        {vice.limit_unit === "minutes" ? "min" : ""}
      </p>
    </div>
  );
}
