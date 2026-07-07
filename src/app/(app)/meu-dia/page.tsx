import { format } from "date-fns";
import {
  getCalendarFormOptions,
  getDayEvents,
} from "@/lib/calendar/queries";
import { DayPlannerView } from "@/components/calendar/day-planner-view";

export default async function MeuDiaPage() {
  const now = new Date();
  const [events, options] = await Promise.all([
    getDayEvents(now),
    getCalendarFormOptions(),
  ]);

  return (
    <DayPlannerView
      initialEvents={events}
      initialDate={format(now, "yyyy-MM-dd")}
      options={options}
    />
  );
}
