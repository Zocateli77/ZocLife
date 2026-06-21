"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createCalendarEvent,
  updateCalendarEvent,
} from "@/lib/calendar/actions";
import {
  EVENT_PRIORITIES,
  EVENT_PRIORITY_LABELS,
  EVENT_STATUSES,
  EVENT_STATUS_LABELS,
  EVENT_TYPES,
  EVENT_TYPE_LABELS,
  type EventPriority,
  type EventStatus,
  type EventType,
} from "@/lib/calendar/constants";
import type { CalendarEventWithRelations, SelectOption } from "@/lib/calendar/types";
import { buildDatetime, splitDatetime } from "@/lib/calendar/utils";
import {
  WEEKDAY_OPTIONS,
  buildWeeklyRule,
  parseWeeklyRule,
} from "@/lib/calendar/recurrence";
import { cn } from "@/lib/utils";

type FormOptions = {
  tasks: SelectOption[];
  projects: SelectOption[];
  contents: SelectOption[];
  documents: SelectOption[];
};

type EventFormProps = {
  event?: CalendarEventWithRelations | null;
  defaultDate?: Date;
  options: FormOptions;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "quick" | "full";
};

export function EventForm({
  event,
  defaultDate,
  options,
  onSuccess,
  onCancel,
  mode = "full",
}: EventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [showFull, setShowFull] = useState(mode === "full");

  const initial = event
    ? splitDatetime(event.start_datetime)
    : {
        date: format(defaultDate ?? new Date(), "yyyy-MM-dd"),
        time: "",
      };

  const endInitial = event?.end_datetime
    ? splitDatetime(event.end_datetime)
    : { date: initial.date, time: "" };

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [eventType, setEventType] = useState<EventType>(
    event?.event_type ?? "appointment",
  );
  const [status, setStatus] = useState<EventStatus>(
    event?.status ?? "planned",
  );
  const [priority, setPriority] = useState<EventPriority>(
    event?.priority ?? "medium",
  );
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [endTime, setEndTime] = useState(endInitial.time);
  const [taskId, setTaskId] = useState(event?.related_task_id ?? "");
  const [projectId, setProjectId] = useState(event?.related_project_id ?? "");
  const [contentId, setContentId] = useState(event?.related_content_id ?? "");
  const [documentId, setDocumentId] = useState(event?.related_document_id ?? "");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [isRecurring, setIsRecurring] = useState(event?.is_recurring ?? false);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(
    parseWeeklyRule(event?.recurrence_rule) ?? [],
  );

  function toggleRecurrenceDay(day: number) {
    setRecurrenceDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => a - b),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Título é obrigatório");
      return;
    }

    if (time && endTime && endTime <= time) {
      setError("O horário de término deve ser depois do início.");
      return;
    }

    if (isRecurring && recurrenceDays.length === 0) {
      setError("Escolha pelo menos um dia da semana para a recorrência.");
      return;
    }

    setError("");
    const startDatetime = buildDatetime(date, time || undefined);
    const endDatetime = endTime ? buildDatetime(date, endTime) : null;

    const payload = {
      title,
      description: description || null,
      event_type: eventType,
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      status,
      priority,
      related_task_id: taskId || null,
      related_project_id: projectId || null,
      related_content_id: contentId || null,
      related_document_id: documentId || null,
      new_document_title: newDocTitle || null,
      new_document_url: newDocUrl || null,
      notes: notes || null,
      is_recurring: isRecurring,
      recurrence_rule:
        isRecurring && recurrenceDays.length
          ? buildWeeklyRule(recurrenceDays)
          : null,
    };

    startTransition(async () => {
      try {
        if (event) {
          await updateCalendarEvent({ id: event.id, ...payload });
        } else {
          await createCalendarEvent(payload);
        }
        router.refresh();
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar evento");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="event-title">Título *</Label>
        <Input
          id="event-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Gravar vídeo sobre Power Automate"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="event-date">Data *</Label>
          <Input
            id="event-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-type">Tipo</Label>
          <Select
            id="event-type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="event-time">Hora início</Label>
          <Input
            id="event-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-end">Hora fim</Label>
          <Input
            id="event-end"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      {showFull ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="event-status">Status</Label>
              <Select
                id="event-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
              >
                {EVENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {EVENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-priority">Prioridade</Label>
              <Select
                id="event-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as EventPriority)}
              >
                {EVENT_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {EVENT_PRIORITY_LABELS[p]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-desc">Descrição</Label>
            <Textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-task">Tarefa vinculada</Label>
            <Select
              id="event-task"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
            >
              <option value="">Nenhuma</option>
              {options.tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-project">Projeto vinculado</Label>
            <Select
              id="event-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Nenhum</option>
              {options.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-content">Conteúdo vinculado</Label>
            <Select
              id="event-content"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
            >
              <option value="">Nenhum</option>
              {options.contents.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-doc">Documento / roteiro existente</Label>
            <Select
              id="event-doc"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
            >
              <option value="">Nenhum</option>
              {options.documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Ou adicionar novo roteiro (URL)
            </p>
            <Input
              placeholder="Título do roteiro"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
            />
            <Input
              placeholder="https://..."
              value={newDocUrl}
              onChange={(e) => setNewDocUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="recurring" className="cursor-pointer">
              Evento recorrente
            </Label>
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <Label>Repetir nos dias</Label>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAY_OPTIONS.map((d) => {
                  const active = recurrenceDays.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleRecurrenceDay(d.value)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                        active
                          ? "border-teal bg-teal/20 text-teal-text"
                          : "border-border text-muted-foreground hover:bg-muted/40",
                      )}
                    >
                      {d.short}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                A data acima define a partir de quando a repetição começa.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="event-notes">Observações</Label>
            <Textarea
              id="event-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </>
      ) : (
        <button
          type="button"
          className="text-xs text-teal-text hover:underline"
          onClick={() => setShowFull(true)}
        >
          + Adicionar mais detalhes e vínculos
        </button>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending
            ? "Salvando..."
            : event
              ? "Salvar alterações"
              : "Criar evento"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
