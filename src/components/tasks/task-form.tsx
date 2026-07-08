"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTask, updateTask } from "@/lib/tasks/actions";
import {
  TASK_CATEGORIES,
  TASK_CATEGORY_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type TaskCategory,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks/constants";
import type { CreateTaskInput, ProjectOption, TaskWithRelations } from "@/lib/tasks/types";

type TaskFormProps = {
  task?: TaskWithRelations | null;
  draft?: Partial<CreateTaskInput>;
  projects: ProjectOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "quick" | "full";
};

export function TaskForm({
  task,
  draft,
  projects,
  onSuccess,
  onCancel,
  mode = "full",
}: TaskFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [showFull, setShowFull] = useState(mode === "full" || Boolean(draft));

  const today = format(new Date(), "yyyy-MM-dd");

  const [title, setTitle] = useState(task?.title ?? draft?.title ?? "");
  const [description, setDescription] = useState(
    task?.description ?? draft?.description ?? "",
  );
  const [status, setStatus] = useState<TaskStatus>(
    task?.status ?? draft?.status ?? "backlog",
  );
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? draft?.priority ?? "medium",
  );
  const [category, setCategory] = useState<TaskCategory>(
    (task?.category as TaskCategory) ??
      (draft?.category as TaskCategory) ??
      "personal",
  );
  const [dueDate, setDueDate] = useState(task?.due_date ?? draft?.due_date ?? "");
  const [startDate, setStartDate] = useState(
    task?.start_date ?? draft?.start_date ?? "",
  );
  const [projectId, setProjectId] = useState(
    task?.project_id ?? draft?.project_id ?? "",
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    task?.estimated_minutes?.toString() ??
      draft?.estimated_minutes?.toString() ??
      "",
  );
  const [tags, setTags] = useState(
    task?.tags?.join(", ") ?? draft?.tags?.join(", ") ?? "",
  );
  const [notes, setNotes] = useState(task?.notes ?? draft?.notes ?? "");
  const [checklistText, setChecklistText] = useState(
    draft?.checklist?.join("\n") ?? "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Título é obrigatório");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const payload = {
          title,
          description: description || null,
          status,
          priority,
          category,
          due_date: dueDate || null,
          start_date: startDate || null,
          project_id: projectId || null,
          estimated_minutes: estimatedMinutes
            ? parseInt(estimatedMinutes, 10)
            : null,
          tags: tags
            ? tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          notes: notes || null,
          sync_calendar: true,
        };

        if (task) {
          await updateTask({ id: task.id, ...payload });
        } else {
          const checklist = checklistText
            ? checklistText.split("\n").map((l) => l.trim()).filter(Boolean)
            : [];
          await createTask({ ...payload, checklist });
        }

        router.refresh();
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar tarefa");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="O que precisa ser feito?"
          autoFocus
        />
      </div>

      {showFull ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {TASK_PRIORITY_LABELS[p]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {TASK_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Projeto</Label>
              <Select
                id="project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">Nenhum</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="due_date">Data limite</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de início</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated">Estimativa (minutos)</Label>
            <Input
              id="estimated"
              type="number"
              min={1}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              placeholder="30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da tarefa..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="urgente, casa, power-automate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {!task && (
            <div className="space-y-2">
              <Label htmlFor="checklist">Checklist (um item por linha)</Label>
              <Textarea
                id="checklist"
                value={checklistText}
                onChange={(e) => setChecklistText(e.target.value)}
                placeholder={"Pesquisar tema\nGravar vídeo\nEditar"}
                rows={3}
              />
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="due_date_quick">Data</Label>
            <Input
              id="due_date_quick"
              type="date"
              value={dueDate || today}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority_quick">Prioridade</Label>
            <Select
              id="priority_quick"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORITY_LABELS[p]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      {mode === "quick" && !showFull && (
        <button
          type="button"
          className="text-xs text-teal-text hover:underline"
          onClick={() => setShowFull(true)}
        >
          + Adicionar mais detalhes
        </button>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Salvando..." : task ? "Salvar alterações" : "Criar tarefa"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
