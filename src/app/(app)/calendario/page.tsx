import { format } from "date-fns";
import {
  getCalendarFormOptions,
  getMonthEvents,
} from "@/lib/calendar/queries";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarioPage() {
  const now = new Date();
  const [events, options] = await Promise.all([
    getMonthEvents(now),
    getCalendarFormOptions(),
  ]);

  return (
    <CalendarView
      initialEvents={events}
      initialDate={format(now, "yyyy-MM-dd")}
      options={options}
    />
  );
}
