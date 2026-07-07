"use client";

import { useState } from "react";
import { Plus, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { ViceCard } from "./vice-card";
import { ViceForm } from "./vice-form";
import { ViceDetailSheet } from "./vice-detail-sheet";
import { isWithinLimit } from "@/lib/vices/stats";
import type { ViceWithStats } from "@/lib/vices/types";

type ViceDetail = Awaited<
  ReturnType<typeof import("@/lib/vices/queries").getViceById>
>;

type VicesViewProps = {
  vices: ViceWithStats[];
};

export function VicesView({ vices }: VicesViewProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedVice, setSelectedVice] = useState<ViceDetail>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const withLogsToday = vices.filter((v) => v.todayLog);
  const withinLimitToday = withLogsToday.filter((v) =>
    isWithinLimit(v, v.todayLog),
  ).length;

  async function handleViceClick(vice: ViceWithStats) {
    setDetailOpen(true);
    try {
      const full = await fetch(`/api/vices/${vice.id}`).then((r) => r.json());
      if (full && !full.error) setSelectedVice(full);
    } catch {
      setSelectedVice(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Vícios</h2>
          <p className="text-sm text-muted-foreground">
            Meta de reduzir — {withinLimitToday}/{withLogsToday.length} dentro do
            limite hoje
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Novo vício
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-teal-text" />
          <span className="text-sm">
            Registre quanto usou hoje. Fique <strong>abaixo</strong> do limite
            diário.
          </span>
        </div>
      </div>

      {vices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <TrendingDown className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum vício cadastrado. Ex: Celular com limite de 1:30/dia.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vices.map((vice) => (
            <ViceCard
              key={vice.id}
              vice={vice}
              onClick={() => handleViceClick(vice)}
            />
          ))}
        </div>
      )}

      <Sheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Novo vício"
        description="Defina um limite diário para reduzir"
      >
        <ViceForm
          mode="quick"
          onSuccess={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      </Sheet>

      <ViceDetailSheet
        vice={selectedVice}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
