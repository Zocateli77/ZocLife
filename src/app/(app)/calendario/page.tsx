import { parseISO } from "date-fns";
import {
  getCalendarFormOptions,
  getMonthEvents,
} from "@/lib/calendar/queries";
import { getTodayInAppTz } from "@/lib/date";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarioPage() {
  const today = getTodayInAppTz();
  const [events, options] = await Promise.all([
    getMonthEvents(parseISO(today)),
    getCalendarFormOptions(),
  ]);

  return (
    <CalendarView
      initialEvents={events}
      initialDate={today}
      options={options}
    />
  );
}
