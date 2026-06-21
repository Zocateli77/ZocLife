"use client";

import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { Calendar, CheckCircle2, Circle } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleTaskComplete } from "@/lib/tasks/actions";
import {
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type TaskCategory,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks/constants";
import type { TaskWithRelations } from "@/lib/tasks/types";

type TaskListProps = {
  tasks: TaskWithRelations[];
  onTaskClick: (task: TaskWithRelations) => void;
  filterStatus?: TaskStatus | "all";
  filterPriority?: TaskPriority | "all";
};

const priorityVariant: Record<
  TaskPriority,
  "secondary" | "warning" | "danger"
> = {
  low: "secondary",
  medium: "secondary",
  high: "warning",
};

export function TaskList({
  tasks,
  onTaskClick,
  filterStatus = "all",
  filterPriority = "all",
}: TaskListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  function handleToggle(e: React.MouseEvent, taskId: string) {
    e.stopPropagation();
    startTransition(async () => {
      await toggleTaskComplete(taskId);
      router.refresh();
    });
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhuma tarefa encontrada com esses filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map((task) => {
        const isOverdue =
          task.due_date &&
          task.status !== "done" &&
          isBefore(parseISO(task.due_date), startOfDay(new Date()));

        return (
          <button
            key={task.id}
            type="button"
            onClick={() => onTaskClick(task)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-md",
              task.status === "done" && "opacity-70",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              disabled={isPending}
              onClick={(e) => handleToggle(e, task.id)}
              aria-label={
                task.status === "done"
                  ? "Marcar como pendente"
                  : "Marcar como concluída"
              }
            >
              {task.status === "done" ? (
                <CheckCircle2 className="h-5 w-5 text-teal-text" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-medium",
                  task.status === "done" && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {TASK_STATUS_LABELS[task.status]}
                </Badge>
                <Badge
                  variant={priorityVariant[task.priority]}
                  className="text-[10px]"
                >
                  {TASK_PRIORITY_LABELS[task.priority]}
                </Badge>
                {task.category && (
                  <span className="text-[10px] text-muted-foreground">
                    {TASK_CATEGORY_LABELS[task.category as TaskCategory]}
                  </span>
                )}
                {task.project && (
                  <span className="text-[10px] text-teal-text">{task.project.name}</span>
                )}
              </div>
            </div>

            {task.due_date && (
              <span
                className={cn(
                  "flex shrink-0 items-center gap-1 text-xs",
                  isOverdue ? "text-danger" : "text-muted-foreground",
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                {format(parseISO(task.due_date), "dd/MM/yyyy")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
