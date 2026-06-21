"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveWeeklyReview } from "@/lib/reviews/actions";
import type { WeeklySummary } from "@/lib/reviews/queries";

type Review = {
  id: string;
  week_start: string;
  week_end: string;
  biggest_win: string | null;
  what_worked: string | null;
  what_did_not_work: string | null;
  next_week_focus: string | null;
  completed_summary: string | null;
};

type Props = { summary: WeeklySummary; history: Review[] };

export function ReviewView({ summary, history }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [worked, setWorked] = useState("");
  const [notWorked, setNotWorked] = useState("");
  const [win, setWin] = useState("");
  const [focus, setFocus] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      await saveWeeklyReview({
        what_worked: worked,
        what_did_not_work: notWorked,
        biggest_win: win,
        next_week_focus: focus,
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Revisão Semanal</h2>
        <p className="text-sm text-muted-foreground">{summary.week_start} — {summary.week_end}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tarefas concluídas", value: summary.completed_tasks },
          { label: "Treinos", value: summary.workouts_done },
          { label: "Capítulos lidos", value: summary.chapters_read },
          { label: "Conteúdos", value: summary.content_produced },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="font-heading text-2xl font-bold text-teal-text">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Reflexão da semana</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>O que funcionou?</Label><Textarea value={worked} onChange={(e) => setWorked(e.target.value)} /></div>
            <div><Label>O que não funcionou?</Label><Textarea value={notWorked} onChange={(e) => setNotWorked(e.target.value)} /></div>
            <div><Label>Maior vitória</Label><Textarea value={win} onChange={(e) => setWin(e.target.value)} /></div>
            <div><Label>Foco da próxima semana</Label><Textarea value={focus} onChange={(e) => setFocus(e.target.value)} /></div>
            <Button type="submit" disabled={pending}>Salvar revisão (+40 pts)</Button>
          </form>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <div>
          <h3 className="mb-3 font-heading font-semibold">Histórico</h3>
          <ul className="space-y-2">
            {history.map((r) => (
              <li key={r.id} className="rounded-lg border border-border p-4 text-sm">
                <p className="font-medium">{r.week_start} — {r.week_end}</p>
                <p className="text-muted-foreground">{r.completed_summary}</p>
                {r.biggest_win && <p className="mt-1 text-teal-text">🏆 {r.biggest_win}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {history.length === 0 && (
        <div className="rounded-xl border border-dashed py-12 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Sua primeira revisão aparecerá aqui</p>
        </div>
      )}
    </div>
  );
}
