"use client";

import {
  addDays,
  format,
  isToday,
  parseISO,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  EVENT_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  type EventType,
} from "@/lib/calendar/constants";
import type { CalendarEventWithRelations } from "@/lib/calendar/types";
import { formatEventTime } from "@/lib/calendar/utils";

type CalendarDayViewProps = {
  currentDate: Date;
  events: CalendarEventWithRelations[];
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEventWithRelations) => void;
};

export function CalendarDayView({
  currentDate,
  events,
  onDateChange,
  onEventClick,
}: CalendarDayViewProps) {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.start_datetime).getTime() -
      new Date(b.start_datetime).getTime(),
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold capitalize">
            {format(currentDate, "EEEE", { locale: ptBR })}
          </h3>
          <p className="text-sm text-muted-foreground">
            {format(currentDate, "d 'de' MMMM yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDateChange(subDays(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
          >
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDateChange(addDays(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum evento neste dia.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((event) => (
            <button
              key={event.occurrence_key ?? event.id}
              type="button"
              onClick={() => onEventClick(event)}
              className={cn(
                "flex w-full gap-4 rounded-xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-md",
                event.status === "completed" && "opacity-60",
              )}
            >
              <div className="shrink-0 text-center">
                <p className="font-heading text-lg font-bold text-teal-text">
                  {formatEventTime(event.start_datetime) === "Dia inteiro"
                    ? "—"
                    : format(parseISO(event.start_datetime), "HH:mm")}
                </p>
                {event.end_datetime && (
                  <p className="text-xs text-muted-foreground">
                    até {format(parseISO(event.end_datetime), "HH:mm")}
                  </p>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium">{event.title}</p>
                {event.description && (
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {EVENT_TYPE_LABELS[event.event_type as EventType]}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {EVENT_STATUS_LABELS[event.status]}
                  </Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isToday(currentDate) && sorted.length > 0 && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {sorted.filter((e) => e.status !== "completed").length} evento(s)
          pendente(s) hoje
        </p>
      )}
    </div>
  );
}
