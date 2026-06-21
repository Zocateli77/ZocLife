"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { createContentItem, updateContentStatus } from "@/lib/content/actions";
import { CONTENT_STATUS_LABELS, PLATFORM_LABELS } from "@/lib/content/types";
import type { ContentItem } from "@/lib/content/types";

const PIPELINE_COLS = ["idea", "script", "ready_to_record", "recorded", "editing", "scheduled", "published"];

export function ContentView({ items }: { items: ContentItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [scriptUrl, setScriptUrl] = useState("");
  const [plannedDate, setPlannedDate] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      await createContentItem({ title, platform, script_url: scriptUrl || undefined, planned_date: plannedDate || undefined });
      setOpen(false);
      router.refresh();
    });
  }

  function advance(id: string, current: string) {
    const idx = PIPELINE_COLS.indexOf(current);
    const next = PIPELINE_COLS[Math.min(idx + 1, PIPELINE_COLS.length - 1)];
    start(async () => {
      await updateContentStatus(id, next);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Produção · Pipeline"
        title="Conteúdo"
        description="Pipeline de produção"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Novo
          </Button>
        }
      />

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:snap-none">
        {PIPELINE_COLS.map((status) => {
          const col = items.filter((i) => i.status === status);
          return (
            <div key={status} className="w-[82vw] max-w-[16rem] shrink-0 snap-start sm:w-64">
              <h3 className="mb-2 flex items-center justify-between font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <span>{CONTENT_STATUS_LABELS[status]}</span>
                <span>{col.length}</span>
              </h3>
              <div className="space-y-2 rounded-xl border border-dashed border-border bg-muted/20 p-2 min-h-[120px]">
                {col.map((item) => (
                  <Card key={item.id} className="shadow-sm">
                    <CardContent className="p-3 space-y-2">
                      <p className="text-sm font-medium">{item.title}</p>
                      <Badge variant="outline" className="text-[10px]">{PLATFORM_LABELS[item.platform]}</Badge>
                      {item.script_url && (
                        <a href={item.script_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-teal-text hover:underline">
                          <ExternalLink className="h-3 w-3" /> Roteiro
                        </a>
                      )}
                      {status !== "published" && (
                        <Button size="sm" variant="outline" className="w-full" onClick={() => advance(item.id, status)} disabled={pending}>
                          Avançar
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <Video className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Crie sua primeira ideia de conteúdo</p>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen} title="Novo conteúdo">
        <form onSubmit={handleCreate} className="space-y-3">
          <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div><Label>Plataforma</Label>
            <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {Object.entries(PLATFORM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div><Label>URL do roteiro</Label><Input value={scriptUrl} onChange={(e) => setScriptUrl(e.target.value)} placeholder="https://..." /></div>
          <div><Label>Data planejada</Label><Input type="date" value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} /></div>
          <Button type="submit" disabled={pending} className="w-full">Criar</Button>
        </form>
      </Sheet>
    </div>
  );
}
