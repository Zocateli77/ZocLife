"use client";

import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TaskForm } from "@/components/tasks/task-form";
import type { RefinedTaskDraft } from "@/lib/ai/refined-task-schema";
import type { CreateTaskInput, ProjectOption } from "@/lib/tasks/types";

type AiTaskComposerProps = {
  projects: ProjectOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

type Step = "input" | "review";

function draftToCreateInput(draft: RefinedTaskDraft): Partial<CreateTaskInput> {
  return {
    title: draft.title,
    description: draft.description,
    priority: draft.priority,
    category: draft.category,
    due_date: draft.due_date,
    estimated_minutes: draft.estimated_minutes,
    tags: draft.tags,
    checklist: draft.checklist,
    status: "backlog",
  };
}

export function AiTaskComposer({
  projects,
  onSuccess,
  onCancel,
}: AiTaskComposerProps) {
  const [step, setStep] = useState<Step>("input");
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<RefinedTaskDraft | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState("");

  async function handleRefine() {
    const trimmed = input.trim();
    if (trimmed.length < 3) {
      setError("Descreva a tarefa com pelo menos 3 caracteres");
      return;
    }

    setError("");
    setIsRefining(true);

    try {
      const response = await fetch("/api/tasks/ai-refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Erro ao refinar tarefa");
      }

      setDraft(data as RefinedTaskDraft);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao refinar tarefa");
    } finally {
      setIsRefining(false);
    }
  }

  function handleBack() {
    setStep("input");
    setDraft(null);
    setError("");
  }

  if (step === "review" && draft) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Revise o rascunho gerado pela IA antes de criar a tarefa.
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <TaskForm
          draft={draftToCreateInput(draft)}
          projects={projects}
          mode="full"
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ai-task-input">Descreva a tarefa em linguagem natural</Label>
        <Textarea
          id="ai-task-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex: preciso gravar um vídeo sobre Power Automate no sábado, com roteiro e edição"
          rows={6}
          autoFocus
        />
      </div>

      <p className="text-xs text-muted-foreground">
        A IA vai sugerir título, prioridade, categoria, prazo e subtarefas. Você
        revisa tudo antes de salvar.
      </p>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          className="flex-1"
          onClick={handleRefine}
          disabled={isRefining}
        >
          <Sparkles className="mr-1 h-4 w-4" />
          {isRefining ? "Refinando..." : "Refinar com IA"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
