"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addDays,
  endOfDay,
  format,
  isToday,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { EventForm } from "./event-form";
import { EventDetailSheet } from "./event-detail-sheet";
import { fetchEventsInRange } from "@/lib/calendar/actions";
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  type EventType,
} from "@/lib/calendar/constants";
import type {
  CalendarEventWithRelations,
  SelectOption,
} from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

const START_HOUR = 5;
const END_HOUR = 24;
const HOUR_HEIGHT = 64;

type FormOptions = {
  tasks: SelectOption[];
  projects: SelectOption[];
  contents: SelectOption[];
  documents: SelectOption[];
};

type DayPlannerViewProps = {
  initialEvents: CalendarEventWithRelations[];
  initialDate: string;
  options: FormOptions;
};

function getEventMinutes(iso: string): number {
  const d = parseISO(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function getEventLayout(event: CalendarEventWithRelations) {
  const startMin = getEventMinutes(event.start_datetime);
  const endMin = event.end_datetime
    ? getEventMinutes(event.end_datetime)
    : startMin + 60;

  const gridStartMin = START_HOUR * 60;
  const gridEndMin = END_HOUR * 60;
  const clampedStart = Math.max(startMin, gridStartMin);
  const clampedEnd = Math.min(Math.max(endMin, clampedStart + 30), gridEndMin);

  const top = ((clampedStart - gridStartMin) / 60) * HOUR_HEIGHT;
  const height = Math.max(
    ((clampedEnd - clampedStart) / 60) * HOUR_HEIGHT,
    28,
  );

  return { top, height };
}

function formatDurationMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function DayPlannerView({
  initialEvents,
  initialDate,
  options,
}: DayPlannerViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(initialDate));
  const [events, setEvents] = useState(initialEvents);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEventWithRelations | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [, startTransition] = useTransition();

  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i,
  );

  const loadEvents = useCallback((date: Date) => {
    const start = startOfDay(date);
    const end = endOfDay(date);

    startTransition(async () => {
      const data = await fetchEventsInRange(
        start.toISOString(),
        end.toISOString(),
      );
      setEvents(data);
    });
  }, []);

  function handleDateChange(date: Date) {
    setCurrentDate(date);
    loadEvents(date);
  }

  function handleHourClick(hour: number) {
    const slot = new Date(currentDate);
    slot.setHours(hour, 0, 0, 0);
    setCreateDefaultDate(slot);
    setCreateOpen(true);
  }

  async function handleEventClick(event: CalendarEventWithRelations) {
    setSelectedEvent(event);
    setDetailOpen(true);

    try {
      const full = await fetch(`/api/calendar/${event.id}`).then((r) =>
        r.json(),
      );
      if (full && !full.error) setSelectedEvent(full);
    } catch {
      // keep basic event data
    }
  }

  function handleCreateSuccess() {
    setCreateOpen(false);
    loadEvents(currentDate);
    router.refresh();
  }

  const occupiedMinutes = events.reduce((acc, e) => {
    const start = getEventMinutes(e.start_datetime);
    const end = e.end_datetime ? getEventMinutes(e.end_datetime) : start + 60;
    return acc + Math.max(0, end - start);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Meu Dia</h2>
          <p className="text-sm capitalize text-muted-foreground">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDateChange(subDays(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDateChange(new Date())}
          >
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDateChange(addDays(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setCreateDefaultDate(currentDate);
              setCreateOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Novo bloco
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-card p-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-teal-text" />
          <span>
            <strong>{events.length}</strong> bloco(s)
          </span>
        </div>
        <span className="text-muted-foreground">
          {formatDurationMinutes(occupiedMinutes)} ocupadas
        </span>
        {isToday(currentDate) && (
          <span className="text-muted-foreground">
            {events.filter((e) => e.status !== "completed").length} pendente(s)
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <div className="flex min-w-[320px]">
          <div className="w-14 shrink-0 border-r border-border">
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-border/50 pr-2 text-right text-xs text-muted-foreground"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="relative -top-2">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          <div
            className="relative flex-1"
            style={{ height: totalHeight }}
          >
            {hours.map((hour) => (
              <button
                key={hour}
                type="button"
                onClick={() => handleHourClick(hour)}
                className="absolute left-0 right-0 border-b border-border/40 transition-colors hover:bg-teal/5"
                style={{
                  top: (hour - START_HOUR) * HOUR_HEIGHT,
                  height: HOUR_HEIGHT,
                }}
                aria-label={`Adicionar bloco às ${hour}:00`}
              />
            ))}

            {events.map((event) => {
              const { top, height } = getEventLayout(event);
              const typeColor =
                EVENT_TYPE_COLORS[event.event_type as EventType];

              return (
                <button
                  key={event.occurrence_key ?? event.id}
                  type="button"
                  onClick={() => handleEventClick(event)}
                  className={cn(
                    "absolute left-1 right-2 overflow-hidden rounded-lg border px-2 py-1 text-left text-xs transition-shadow hover:shadow-md",
                    typeColor,
                    event.status === "completed" && "opacity-60",
                  )}
                  style={{ top, height, minHeight: 28 }}
                >
                  <p className="truncate font-medium">{event.title}</p>
                  <p className="truncate opacity-80">
                    {format(parseISO(event.start_datetime), "HH:mm")}
                    {event.end_datetime &&
                      ` – ${format(parseISO(event.end_datetime), "HH:mm")}`}
                  </p>
                  <p className="truncate text-[10px] opacity-70">
                    {EVENT_TYPE_LABELS[event.event_type as EventType]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Sheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Novo bloco no dia"
        description={format(createDefaultDate, "dd/MM/yyyy HH:mm")}
      >
        <EventForm
          defaultDate={createDefaultDate}
          options={options}
          mode="quick"
          onSuccess={handleCreateSuccess}
          onCancel={() => setCreateOpen(false)}
        />
      </Sheet>

      <EventDetailSheet
        event={selectedEvent}
        options={options}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
