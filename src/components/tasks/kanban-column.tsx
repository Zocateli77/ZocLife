"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import {
  TASK_STATUS_LABELS,
  type TaskStatus,
} from "@/lib/tasks/constants";
import type { TaskWithRelations } from "@/lib/tasks/types";
import { TaskCard } from "./task-card";

type KanbanColumnProps = {
  status: TaskStatus;
  tasks: TaskWithRelations[];
  onTaskClick: (task: TaskWithRelations) => void;
  activeId?: string | null;
};

export function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  activeId,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-[82vw] max-w-[18rem] shrink-0 snap-start flex-col sm:w-72">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {TASK_STATUS_LABELS[status]}
        </h3>
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[200px] flex-1 flex-col gap-2 rounded-xl border border-dashed border-border/60 bg-muted/30 p-2 transition-colors",
          isOver && "border-teal bg-teal/5",
        )}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            isDragging={activeId === task.id}
          />
        ))}

        {tasks.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Arraste tarefas aqui
          </p>
        )}
      </div>
    </div>
  );
}
