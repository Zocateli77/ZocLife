"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ExternalLink,
  FileText,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EventForm } from "./event-form";
import {
  deleteCalendarEvent,
  updateEventStatus,
} from "@/lib/calendar/actions";
import { describeRecurrenceRule } from "@/lib/calendar/recurrence";
import {
  EVENT_PRIORITY_LABELS,
  EVENT_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  type EventType,
} from "@/lib/calendar/constants";
import type {
  CalendarEventWithRelations,
  SelectOption,
} from "@/lib/calendar/types";
import { formatEventTime } from "@/lib/calendar/utils";

type FormOptions = {
  tasks: SelectOption[];
  projects: SelectOption[];
  contents: SelectOption[];
  documents: SelectOption[];
};

type EventDetailSheetProps = {
  event: CalendarEventWithRelations | null;
  options: FormOptions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getScriptUrl(event: CalendarEventWithRelations): string | null {
  if (event.document?.url) return event.document.url;
  if (event.content?.script_url) return event.content.script_url;
  return null;
}

export function EventDetailSheet({
  event,
  options,
  open,
  onOpenChange,
}: EventDetailSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!event) return null;

  const scriptUrl = getScriptUrl(event);

  function handleDelete() {
    startTransition(async () => {
      await deleteCalendarEvent(event!.id);
      router.refresh();
      onOpenChange(false);
    });
  }

  function handleComplete() {
    startTransition(async () => {
      const newStatus =
        event!.status === "completed" ? "planned" : "completed";
      await updateEventStatus(event!.id, newStatus);
      router.refresh();
      onOpenChange(false);
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) setEditing(false);
        onOpenChange(v);
      }}
      title={editing ? "Editar evento" : event.title}
      description={
        editing
          ? "Atualize os detalhes do evento"
          : EVENT_TYPE_LABELS[event.event_type as EventType]
      }
    >
      {editing ? (
        <EventForm
          event={event}
          options={options}
          mode="full"
          onSuccess={() => {
            setEditing(false);
            onOpenChange(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {EVENT_TYPE_LABELS[event.event_type as EventType]}
            </Badge>
            <Badge variant="secondary">
              {EVENT_STATUS_LABELS[event.status]}
            </Badge>
            <Badge variant="warning">
              {EVENT_PRIORITY_LABELS[event.priority]}
            </Badge>
          </div>

          <div className="text-sm">
            <p className="text-muted-foreground">
              {format(parseISO(event.start_datetime), "EEEE, d 'de' MMMM yyyy", {
                locale: ptBR,
              })}
            </p>
            <p className="font-medium">
              {formatEventTime(event.start_datetime)}
              {event.end_datetime &&
                ` — ${formatEventTime(event.end_datetime)}`}
            </p>
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          )}

          {(scriptUrl || event.document?.content || event.content?.script_text) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-teal-text" />
                  Roteiro / Documentação
                </p>
                {scriptUrl && (
                  <a
                    href={scriptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-teal/10 px-4 py-2.5 text-sm font-medium text-teal-text transition-colors hover:bg-teal/20"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir roteiro
                  </a>
                )}
                {(event.document?.content || event.content?.script_text) && (
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {event.document?.content || event.content?.script_text}
                  </div>
                )}
              </div>
            </>
          )}

          {(event.task || event.project || event.content) && (
            <>
              <Separator />
              <div className="space-y-2 text-sm">
                <p className="font-medium">Vínculos</p>
                {event.task && (
                  <Link
                    href="/tarefas"
                    className="block text-teal-text hover:underline"
                  >
                    Tarefa: {event.task.title}
                  </Link>
                )}
                {event.project && (
                  <Link
                    href="/projetos"
                    className="block text-teal-text hover:underline"
                  >
                    Projeto: {event.project.name}
                  </Link>
                )}
                {event.content && (
                  <Link
                    href="/conteudo"
                    className="block text-teal-text hover:underline"
                  >
                    Conteúdo: {event.content.title}
                  </Link>
                )}
              </div>
            </>
          )}

          {event.is_recurring && event.recurrence_rule && (
            <p className="text-xs text-muted-foreground">
              Recorrente: {describeRecurrenceRule(event.recurrence_rule)}
            </p>
          )}

          {event.notes && (
            <>
              <Separator />
              <div>
                <p className="mb-1 text-sm font-medium">Observações</p>
                <p className="text-sm text-muted-foreground">{event.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleComplete} disabled={isPending}>
              <CheckCircle2 className="mr-1 h-4 w-4" />
              {event.status === "completed" ? "Reabrir" : "Marcar como feito"}
            </Button>
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
            title="Excluir este evento?"
            description="O evento será removido permanentemente da sua agenda."
            confirmLabel="Excluir"
            destructive
          />
        </div>
      )}
    </Sheet>
  );
}
