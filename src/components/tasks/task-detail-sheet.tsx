"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, CheckCircle2, Circle } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TaskForm } from "./task-form";
import {
  deleteTask,
  toggleChecklistItem,
  toggleTaskComplete,
} from "@/lib/tasks/actions";
import {
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type TaskCategory,
} from "@/lib/tasks/constants";
import type { ProjectOption, TaskWithRelations } from "@/lib/tasks/types";

type TaskDetailSheetProps = {
  task: TaskWithRelations | null;
  projects: ProjectOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskDetailSheet({
  task,
  projects,
  open,
  onOpenChange,
}: TaskDetailSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!task) return null;

  function handleDelete() {
    startTransition(async () => {
      await deleteTask(task!.id);
      router.refresh();
      onOpenChange(false);
    });
  }

  function handleToggleComplete() {
    startTransition(async () => {
      await toggleTaskComplete(task!.id);
      router.refresh();
    });
  }

  function handleChecklistToggle(itemId: string, checked: boolean) {
    startTransition(async () => {
      await toggleChecklistItem(itemId, checked);
      router.refresh();
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) setEditing(false);
        onOpenChange(v);
      }}
      title={editing ? "Editar tarefa" : task.title}
      description={
        editing
          ? "Atualize os detalhes da tarefa"
          : TASK_STATUS_LABELS[task.status]
      }
    >
      {editing ? (
        <TaskForm
          task={task}
          projects={projects}
          mode="full"
          onSuccess={() => {
            setEditing(false);
            onOpenChange(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{TASK_STATUS_LABELS[task.status]}</Badge>
            <Badge variant="warning">{TASK_PRIORITY_LABELS[task.priority]}</Badge>
            {task.category && (
              <Badge variant="secondary">
                {TASK_CATEGORY_LABELS[task.category as TaskCategory]}
              </Badge>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {task.due_date && (
              <div>
                <p className="text-xs text-muted-foreground">Data limite</p>
                <p className="font-medium">
                  {format(parseISO(task.due_date), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            )}
            {task.project && (
              <div>
                <p className="text-xs text-muted-foreground">Projeto</p>
                <p className="font-medium text-teal-text">{task.project.name}</p>
              </div>
            )}
            {task.estimated_minutes && (
              <div>
                <p className="text-xs text-muted-foreground">Estimativa</p>
                <p className="font-medium">{task.estimated_minutes} min</p>
              </div>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {task.checklist_items && task.checklist_items.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium">Checklist</p>
                <ul className="space-y-2">
                  {task.checklist_items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          handleChecklistToggle(item.id, !item.is_completed)
                        }
                      >
                        {item.is_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-teal-text" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <span
                        className={
                          item.is_completed
                            ? "text-sm line-through text-muted-foreground"
                            : "text-sm"
                        }
                      >
                        {item.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {task.activity && task.activity.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium">Histórico</p>
                <ul className="space-y-1.5">
                  {task.activity.map((a) => (
                    <li
                      key={a.id}
                      className="text-xs text-muted-foreground"
                    >
                      {format(parseISO(a.created_at), "dd/MM HH:mm")} —{" "}
                      {a.action === "status_changed"
                        ? `${a.from_status} → ${a.to_status}`
                        : a.action}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {task.notes && (
            <>
              <Separator />
              <div>
                <p className="mb-1 text-sm font-medium">Observações</p>
                <p className="text-sm text-muted-foreground">{task.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleToggleComplete} disabled={isPending}>
              {task.status === "done" ? "Reabrir" : "Marcar como feito"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(true)}>
              Editar
            </Button>
            <Button
              variant="ghost"
              className="text-danger hover:text-danger"
              onClick={() => setConfirmOpen(true)}
              disabled={isPending}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Excluir
            </Button>
          </div>

          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            onConfirm={handleDelete}
            title="Excluir esta tarefa?"
            description="A tarefa e seu histórico serão removidos permanentemente."
            confirmLabel="Excluir"
            destructive
          />
        </div>
      )}
    </Sheet>
  );
}
