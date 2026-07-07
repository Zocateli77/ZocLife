"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShieldCheck, Trash2, TrendingDown } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ViceForm } from "./vice-form";
import { deleteVice } from "@/lib/vices/actions";
import {
  formatMinutesAsTime,
  formatViceLimit,
  VICE_UNIT_LABELS,
  type ViceUnit,
} from "@/lib/vices/constants";
import { isWithinLimit } from "@/lib/vices/stats";
import type { Vice, ViceLog } from "@/lib/vices/types";

type ViceDetail = Vice & {
  logs: ViceLog[];
  stats: {
    currentStreak: number;
    bestStreak: number;
    withinLimitPercent: number;
    daysWithinLimit: number;
    totalDays: number;
    weeklyAverage: number;
  };
  weekStats: {
    daysWithinLimit: number;
    totalDays: number;
    withinLimitPercent: number;
  };
};

type ViceDetailSheetProps = {
  vice: ViceDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ViceDetailSheet({
  vice,
  open,
  onOpenChange,
}: ViceDetailSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!vice) return null;

  function handleDelete() {
    startTransition(async () => {
      await deleteVice(vice!.id);
      router.refresh();
      onOpenChange(false);
    });
  }

  const recentLogs = vice.logs.slice(0, 14);

  function formatLogValue(val: number): string {
    if (vice!.limit_unit === "minutes") return formatMinutesAsTime(val);
    const unit =
      VICE_UNIT_LABELS[vice!.limit_unit as ViceUnit] ?? vice!.limit_unit;
    return `${val} ${unit}`;
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) setEditing(false);
        onOpenChange(v);
      }}
      title={editing ? "Editar vício" : vice.name}
      description={
        editing ? "Atualize o limite diário" : formatViceLimit(vice.limit_value, vice.limit_unit)
      }
    >
      {editing ? (
        <ViceForm
          vice={vice}
          mode="full"
          onSuccess={() => {
            setEditing(false);
            onOpenChange(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="space-y-5">
          {vice.description && (
            <p className="text-sm text-muted-foreground">{vice.description}</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-teal-text" />
              <p className="font-heading text-xl font-bold">
                {vice.stats.currentStreak}
              </p>
              <p className="text-[10px] text-muted-foreground">Sequência</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <TrendingDown className="mx-auto mb-1 h-4 w-4 text-amber" />
              <p className="font-heading text-xl font-bold">
                {vice.stats.bestStreak}
              </p>
              <p className="text-[10px] text-muted-foreground">Melhor</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className="font-heading text-xl font-bold text-teal-text">
                {vice.stats.withinLimitPercent}%
              </p>
              <p className="text-[10px] text-muted-foreground">Mês no limite</p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Semana: {vice.weekStats.daysWithinLimit}/{vice.weekStats.totalDays}{" "}
            dias dentro do limite · média {vice.stats.weeklyAverage}
            {vice.limit_unit === "minutes" ? "min" : ""}
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
                      <span>{formatLogValue(Number(log.value))}</span>
                      <Badge
                        variant={
                          isWithinLimit(vice, log) ? "success" : "danger"
                        }
                        className="text-[10px]"
                      >
                        {isWithinLimit(vice, log) ? "OK" : "Excedeu"}
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
            title="Excluir este vício?"
            description="O vício e todo o histórico de registros serão removidos permanentemente."
            confirmLabel="Excluir"
            destructive
          />
        </div>
      )}
    </Sheet>
  );
}
