"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, CalendarRange, LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { CalendarMonthView } from "./calendar-month-view";
import { CalendarWeekView } from "./calendar-week-view";
import { CalendarDayView } from "./calendar-day-view";
import { EventForm } from "./event-form";
import { EventDetailSheet } from "./event-detail-sheet";
import { fetchEventsInRange } from "@/lib/calendar/actions";
import type { CalendarViewMode } from "@/lib/calendar/constants";
import type {
  CalendarEventWithRelations,
  SelectOption,
} from "@/lib/calendar/types";

type FormOptions = {
  tasks: SelectOption[];
  projects: SelectOption[];
  contents: SelectOption[];
  documents: SelectOption[];
};

type CalendarViewProps = {
  initialEvents: CalendarEventWithRelations[];
  initialDate: string;
  options: FormOptions;
};

export function CalendarView({
  initialEvents,
  initialDate,
  options,
}: CalendarViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(initialDate));
  const [view, setView] = useState<CalendarViewMode>("month");
  const [events, setEvents] = useState(initialEvents);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEventWithRelations | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [, startTransition] = useTransition();

  const loadEvents = useCallback(
    (date: Date, mode: CalendarViewMode) => {
      let start: Date;
      let end: Date;

      if (mode === "month") {
        start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
        end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
      } else if (mode === "week") {
        start = startOfWeek(date, { weekStartsOn: 1 });
        end = endOfWeek(date, { weekStartsOn: 1 });
      } else {
        start = new Date(date);
        start.setHours(0, 0, 0, 0);
        end = new Date(date);
        end.setHours(23, 59, 59, 999);
      }

      startTransition(async () => {
        const data = await fetchEventsInRange(
          start.toISOString(),
          end.toISOString(),
        );
        setEvents(data);
      });
    },
    [],
  );

  function handleDateChange(date: Date) {
    setCurrentDate(date);
    loadEvents(date, view);
  }

  function handleViewChange(mode: CalendarViewMode) {
    setView(mode);
    loadEvents(currentDate, mode);
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

  function handleDayClick(day: Date) {
    setCurrentDate(day);
    setView("day");
    loadEvents(day, "day");
  }

  function handleCreateSuccess() {
    setCreateOpen(false);
    loadEvents(currentDate, view);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Calendário</h2>
          <p className="text-sm text-muted-foreground">
            {events.length} evento(s) neste período
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border">
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("month")}
              className="rounded-r-none"
            >
              <LayoutGrid className="mr-1 h-4 w-4" />
              Mês
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("week")}
              className="rounded-none border-x border-border"
            >
              <CalendarRange className="mr-1 h-4 w-4" />
              Semana
            </Button>
            <Button
              variant={view === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("day")}
              className="rounded-l-none"
            >
              <CalendarDays className="mr-1 h-4 w-4" />
              Dia
            </Button>
          </div>

          <Button
            onClick={() => {
              setCreateDefaultDate(currentDate);
              setCreateOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Novo evento
          </Button>
        </div>
      </div>

      {view === "month" && (
        <CalendarMonthView
          currentDate={currentDate}
          events={events}
          onDateChange={handleDateChange}
          onEventClick={handleEventClick}
          onDayClick={handleDayClick}
        />
      )}

      {view === "week" && (
        <CalendarWeekView
          currentDate={currentDate}
          events={events}
          onDateChange={handleDateChange}
          onEventClick={handleEventClick}
          onDayClick={handleDayClick}
        />
      )}

      {view === "day" && (
        <CalendarDayView
          currentDate={currentDate}
          events={events}
          onDateChange={handleDateChange}
          onEventClick={handleEventClick}
        />
      )}

      <Sheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Novo evento"
        description={format(createDefaultDate, "dd/MM/yyyy")}
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
