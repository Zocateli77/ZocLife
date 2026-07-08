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
            className="bg-muted/50 px-1 py-2 text-center font-mono text-[0.6rem] font-medium uppercase tracking-[0.06em] text-muted-foreground sm:px-2 sm:text-[0.65rem] sm:tracking-[0.1em]"
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
                "min-h-[64px] cursor-pointer bg-card p-1 text-left transition-colors hover:bg-muted/30 sm:min-h-[110px] sm:p-1.5",
                !inMonth && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "mb-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[0.7rem] font-medium sm:mb-1 sm:h-6 sm:w-6 sm:text-xs",
                  today && "bg-teal text-ink",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((e, i) => (
                  <div
                    key={e.occurrence_key ?? e.id}
                    className={cn(i === 2 && "hidden sm:block")}
                  >
                    <EventChip
                      event={e}
                      compact
                      onClick={() => onEventClick(e)}
                    />
                  </div>
                ))}
                {/* On mobile show "+N" once more than 2 fit; on desktop once more than 3 fit. */}
                {dayEvents.length > 2 && (
                  <p className="pl-0.5 text-[10px] text-muted-foreground">
                    <span className="sm:hidden">+{dayEvents.length - 2}</span>
                    {dayEvents.length > 3 && (
                      <span className="hidden sm:inline">
                        +{dayEvents.length - 3} mais
                      </span>
                    )}
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
