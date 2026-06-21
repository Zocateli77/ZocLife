import { cn } from "@/lib/utils";
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  type EventType,
} from "@/lib/calendar/constants";
import type { CalendarEventWithRelations } from "@/lib/calendar/types";
import { formatEventTime } from "@/lib/calendar/utils";

type EventChipProps = {
  event: CalendarEventWithRelations;
  onClick?: () => void;
  compact?: boolean;
};

export function EventChip({ event, onClick, compact }: EventChipProps) {
  const colorClass = EVENT_TYPE_COLORS[event.event_type as EventType];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "w-full truncate rounded border px-1.5 py-0.5 text-left text-[11px] font-medium transition-opacity hover:opacity-80",
        colorClass,
        event.status === "completed" && "opacity-50 line-through",
        event.status === "cancelled" && "opacity-40 line-through",
      )}
      title={`${EVENT_TYPE_LABELS[event.event_type as EventType]}: ${event.title}`}
    >
      {!compact && (
        <span className="mr-1 opacity-70">
          {formatEventTime(event.start_datetime)}
        </span>
      )}
      {event.title}
    </button>
  );
}
