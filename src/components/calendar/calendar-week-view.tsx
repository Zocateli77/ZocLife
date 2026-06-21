"use client";

import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarEventWithRelations } from "@/lib/calendar/types";
import { EventChip } from "./event-chip";
import { formatEventTime } from "@/lib/calendar/utils";

type CalendarWeekViewProps = {
  currentDate: Date;
  events: CalendarEventWithRelations[];
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEventWithRelations) => void;
  onDayClick: (date: Date) => void;
};

export function CalendarWeekView({
  currentDate,
  events,
  onDateChange,
  onEventClick,
  onDayClick,
}: CalendarWeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  function getEventsForDay(day: Date) {
    return events
      .filter((e) => isSameDay(parseISO(e.start_datetime), day))
      .sort(
        (a, b) =>
          new Date(a.start_datetime).getTime() -
          new Date(b.start_datetime).getTime(),
      );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold">
          {format(weekStart, "d MMM", { locale: ptBR })} —{" "}
          {format(weekEnd, "d MMM yyyy", { locale: ptBR })}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDateChange(subWeeks(currentDate, 1))}
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
            onClick={() => onDateChange(addWeeks(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);

          return (
            <div
              key={day.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onDayClick(day)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDayClick(day);
                }
              }}
              className={cn(
                "cursor-pointer rounded-xl border border-border bg-card p-3 text-left transition-shadow hover:shadow-md",
                isToday(day) && "border-teal/50 ring-1 ring-teal/30",
              )}
            >
              <div className="mb-2">
                <p className="text-xs capitalize text-muted-foreground">
                  {format(day, "EEE", { locale: ptBR })}
                </p>
                <p
                  className={cn(
                    "font-heading text-lg font-bold",
                    isToday(day) && "text-teal-text",
                  )}
                >
                  {format(day, "d")}
                </p>
              </div>

              <div className="space-y-1">
                {dayEvents.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground">—</p>
                ) : (
                  dayEvents.map((e) => (
                    <div key={e.occurrence_key ?? e.id} className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground">
                        {formatEventTime(e.start_datetime)}
                      </p>
                      <EventChip
                        event={e}
                        onClick={() => onEventClick(e)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
