"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";
import type { CalendarEventWithRelations } from "@/lib/calendar/types";
import { EventChip } from "./event-chip";

type CalendarMonthViewProps = {
  currentDate: Date;
  events: CalendarEventWithRelations[];
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEventWithRelations) => void;
  onDayClick: (date: Date) => void;
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarMonthView({
  currentDate,
  events,
  onDateChange,
  onEventClick,
  onDayClick,
}: CalendarMonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  function getEventsForDay(day: Date) {
    return events.filter((e) =>
      isSameDay(parseISO(e.start_datetime), day),
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Eyebrow className="mb-0.5">Agenda · Mês</Eyebrow>
          <h3 className="font-heading text-lg font-semibold capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h3>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDateChange(subMonths(currentDate, 1))}
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
            onClick={() => onDateChange(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-xl border border-border bg-border overflow-hidden">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="bg-muted/50 px-2 py-2 text-center font-mono text-[0.65rem] font-medium uppercase tracking-[0.1em] text-muted-foreground"
          >
            {d}
          </div>
        ))}

        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const inMonth = isSameMonth(day, currentDate);

          const today = isToday(day);

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
              aria-current={today ? "date" : undefined}
              aria-label={format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
              className={cn(
                "min-h-[68px] cursor-pointer bg-card p-1.5 text-left transition-colors hover:bg-muted/30 sm:min-h-[110px]",
                !inMonth && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-medium",
                  today && "bg-teal text-ink",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <EventChip
                    key={e.occurrence_key ?? e.id}
                    event={e}
                    compact
                    onClick={() => onEventClick(e)}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-muted-foreground">
                    +{dayEvents.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
