"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { Calendar, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_LABELS,
  type TaskCategory,
  type TaskPriority,
} from "@/lib/tasks/constants";
import type { TaskWithRelations } from "@/lib/tasks/types";

type TaskCardProps = {
  task: TaskWithRelations;
  onClick?: () => void;
  isDragging?: boolean;
};

const priorityVariant: Record<
  TaskPriority,
  "secondary" | "warning" | "danger"
> = {
  low: "secondary",
  medium: "secondary",
  high: "warning",
};

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { task, status: task.status },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const isOverdue =
    task.due_date &&
    task.status !== "done" &&
    isBefore(parseISO(task.due_date), startOfDay(new Date()));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-50 shadow-lg ring-2 ring-teal",
        task.status === "done" && "opacity-70",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          {...listeners}
          {...attributes}
          aria-label="Arrastar tarefa"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="flex-1 text-left"
          onClick={onClick}
        >
          <p
            className={cn(
              "text-sm font-medium leading-snug",
              task.status === "done" && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant={priorityVariant[task.priority]} className="text-[10px]">
              {TASK_PRIORITY_LABELS[task.priority]}
            </Badge>

            {task.category && (
              <Badge variant="outline" className="text-[10px]">
                {TASK_CATEGORY_LABELS[task.category as TaskCategory]}
              </Badge>
            )}

            {task.due_date && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-[10px]",
                  isOverdue ? "text-danger" : "text-muted-foreground",
                )}
              >
                <Calendar className="h-3 w-3" />
                {format(parseISO(task.due_date), "dd/MM")}
              </span>
            )}

            {task.project && (
              <span className="text-[10px] text-teal-text">
                {task.project.name}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
