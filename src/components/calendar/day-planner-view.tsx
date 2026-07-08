"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { DayTimeline } from "./day-timeline";
import { EventDetailSheet } from "./event-detail-sheet";
import { fetchEventsInRange } from "@/lib/calendar/actions";
import { appDayRange } from "@/lib/date";
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

type DayPlannerViewProps = {
  initialEvents: CalendarEventWithRelations[];
  initialDate: string;
  options: FormOptions;
};

export function DayPlannerView({
  initialEvents,
  initialDate,
  options,
}: DayPlannerViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(() => parseISO(initialDate));
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEventWithRelations | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [, startTransition] = useTransition();

  const loadEvents = useCallback((date: Date) => {
    const { startISO, endISO } = appDayRange(format(date, "yyyy-MM-dd"));

    startTransition(async () => {
      const data = await fetchEventsInRange(startISO, endISO);
      setEvents(data);
    });
  }, []);

  function handleDateChange(date: Date) {
    setCurrentDate(date);
    loadEvents(date);
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

  function handleChanged() {
    loadEvents(currentDate);
    router.refresh();
  }

  return (
    <>
      <DayTimeline
        date={currentDate}
        events={events}
        options={options}
        onDateChange={handleDateChange}
        onEventClick={handleEventClick}
        onChanged={handleChanged}
      />

      <EventDetailSheet
        event={selectedEvent}
        options={options}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
