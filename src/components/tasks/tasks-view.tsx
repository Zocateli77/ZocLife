"use client";

import { useMemo, useState } from "react";
import { Kanban, List, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { PageHeader } from "@/components/ui/page-header";
import { KanbanBoard } from "./kanban-board";
import { TaskList } from "./task-list";
import { TaskForm } from "./task-form";
import { TaskDetailSheet } from "./task-detail-sheet";
import { AiTaskComposer } from "./ai-task-composer";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks/constants";
import type { ProjectOption, TaskWithRelations } from "@/lib/tasks/types";

type TasksViewProps = {
  initialTasks: TaskWithRelations[];
  projects: ProjectOption[];
};

type ViewMode = "kanban" | "list";

export function TasksView({ initialTasks, projects }: TasksViewProps) {
  const [view, setView] = useState<ViewMode>("kanban");
  const [createOpen, setCreateOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">(
    "all",
  );

  async function handleTaskClick(task: TaskWithRelations) {
    setSelectedTask(task);
    setDetailOpen(true);

    try {
      const full = await fetch(`/api/tasks/${task.id}`).then((r) => r.json());
      if (full && !full.error) setSelectedTask(full);
    } catch {
      // mantém os dados iniciais da tarefa
    }
  }

  const pending = initialTasks.filter((t) => t.status !== "done").length;
  const done = initialTasks.filter((t) => t.status === "done").length;

  // Priority filter applies to both views; status filter only to the list.
  const kanbanTasks = useMemo(
    () =>
      filterPriority === "all"
        ? initialTasks
        : initialTasks.filter((t) => t.priority === filterPriority),
    [initialTasks, filterPriority],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Execução · Tarefas"
        title="Tarefas"
        description={`${pending} pendentes · ${done} concluídas`}
        actions={
          <>
            <div className="flex rounded-lg border border-border">
              <Button
                variant={view === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("kanban")}
                className="rounded-r-none"
                aria-pressed={view === "kanban"}
              >
                <Kanban className="mr-1 h-4 w-4" />
                Kanban
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                className="rounded-l-none"
                aria-pressed={view === "list"}
              >
                <List className="mr-1 h-4 w-4" />
                Lista
              </Button>
            </div>

            <Button variant="outline" onClick={() => setAiOpen(true)}>
              <Sparkles className="mr-1 h-4 w-4" />
              Refinar com IA
            </Button>

            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Nova tarefa
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-3">
        {view === "list" && (
          <Select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as TaskStatus | "all")
            }
            className="w-40"
            aria-label="Filtrar por status"
          >
            <option value="all">Todos os status</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        )}
        <Select
          value={filterPriority}
          onChange={(e) =>
            setFilterPriority(e.target.value as TaskPriority | "all")
          }
          className="w-40"
          aria-label="Filtrar por prioridade"
        >
          <option value="all">Todas prioridades</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {TASK_PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
      </div>

      {view === "kanban" ? (
        <KanbanBoard tasks={kanbanTasks} onTaskClick={handleTaskClick} />
      ) : (
        <TaskList
          tasks={initialTasks}
          onTaskClick={handleTaskClick}
          filterStatus={filterStatus}
          filterPriority={filterPriority}
        />
      )}

      <Sheet
        open={aiOpen}
        onOpenChange={setAiOpen}
        title="Refinar com IA"
        description="Descreva a tarefa e deixe a IA estruturar um rascunho"
      >
        <AiTaskComposer
          projects={projects}
          onSuccess={() => setAiOpen(false)}
          onCancel={() => setAiOpen(false)}
        />
      </Sheet>

      <Sheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nova tarefa"
        description="Cadastro rápido — expanda para mais detalhes"
      >
        <TaskForm
          projects={projects}
          mode="quick"
          onSuccess={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      </Sheet>

      <TaskDetailSheet
        task={selectedTask}
        projects={projects}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
