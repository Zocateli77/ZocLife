import {
  getCalendarFormOptions,
  getDayEventsByString,
} from "@/lib/calendar/queries";
import { getTodayInAppTz } from "@/lib/date";
import { DayPlannerView } from "@/components/calendar/day-planner-view";

export default async function MeuDiaPage() {
  const today = getTodayInAppTz();
  const [events, options] = await Promise.all([
    getDayEventsByString(today),
    getCalendarFormOptions(),
  ]);

  return (
    <DayPlannerView
      initialEvents={events}
      initialDate={today}
      options={options}
    />
  );
}
