"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Video, ExternalLink, Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { PageHeader } from "@/components/ui/page-header";
import { updateContentStatus } from "@/lib/content/actions";
import { CONTENT_STATUS_LABELS, PLATFORM_LABELS } from "@/lib/content/types";
import type { ContentItem } from "@/lib/content/types";
import { ContentForm } from "./content-form";
import { ContentDetailSheet } from "./content-detail-sheet";
import { AiContentChat } from "./ai-content-chat";
import { AiContentComposer } from "./ai-content-composer";

const PIPELINE_COLS = ["idea", "script", "ready_to_record", "recorded", "editing", "scheduled", "published"];

type AssistantTab = "chat" | "refine";

export function ContentView({ items }: { items: ContentItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [assistantTab, setAssistantTab] = useState<AssistantTab>("chat");
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  function advance(id: string, current: string) {
    const idx = PIPELINE_COLS.indexOf(current);
    const next = PIPELINE_COLS[Math.min(idx + 1, PIPELINE_COLS.length - 1)];
    start(async () => {
      await updateContentStatus(id, next);
      router.refresh();
    });
  }

  function openDetail(item: ContentItem) {
    setSelected(item);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Produção · Pipeline"
        title="Conteúdo"
        description="Pipeline de produção"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAssistantTab("chat");
                setAiOpen(true);
              }}
            >
              <Sparkles className="mr-1 h-4 w-4" />
              Assistente IA
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Novo
            </Button>
          </div>
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
                {col.map((item) => {
                  const attachmentCount = item.attachments?.length ?? 0;
                  return (
                    <Card
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openDetail(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openDetail(item);
                        }
                      }}
                      className="cursor-pointer shadow-sm transition-shadow hover:shadow-md"
                    >
                      <CardContent className="p-3 space-y-2">
                        <p className="text-sm font-medium">{item.title}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{PLATFORM_LABELS[item.platform]}</Badge>
                          {attachmentCount > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <Paperclip className="h-3 w-3" />
                              {attachmentCount}
                            </span>
                          )}
                        </div>
                        {item.script_url && (
                          <a
                            href={item.script_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-teal-text hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> Roteiro
                          </a>
                        )}
                        {status !== "published" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              advance(item.id, status);
                            }}
                            disabled={pending}
                          >
                            Avançar
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
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
        <ContentForm onSuccess={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </Sheet>

      <Sheet
        open={aiOpen}
        onOpenChange={setAiOpen}
        title="Assistente IA"
        description="Social Media Manager do ZocLabs — brainstorm, legendas e ideias"
      >
        <div className="space-y-4">
          <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
            <Button
              type="button"
              variant={assistantTab === "chat" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setAssistantTab("chat")}
            >
              Conversar
            </Button>
            <Button
              type="button"
              variant={assistantTab === "refine" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setAssistantTab("refine")}
            >
              Refinar ideia
            </Button>
          </div>

          {assistantTab === "chat" ? (
            <AiContentChat
              onSuccess={() => setAiOpen(false)}
              onCancel={() => setAiOpen(false)}
            />
          ) : (
            <AiContentComposer
              onSuccess={() => setAiOpen(false)}
              onCancel={() => setAiOpen(false)}
            />
          )}
        </div>
      </Sheet>

      <ContentDetailSheet
        item={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
