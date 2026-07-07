"use client";

import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContentForm } from "@/components/content/content-form";
import type { RefinedContentDraft } from "@/lib/ai/refined-content-schema";
import type { ContentInput } from "@/lib/content/actions";

type AiContentComposerProps = {
  initialInput?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type Step = "input" | "review";

function draftToContentInput(
  draft: RefinedContentDraft,
): Partial<ContentInput> {
  return {
    title: draft.title,
    description: draft.description,
    platform: draft.platform,
    content_type: draft.content_type,
    caption: draft.caption,
    cta: draft.cta,
    hashtags: draft.hashtags,
    script_text: draft.script_text,
    planned_date: draft.planned_date,
    status: "idea",
  };
}

export function AiContentComposer({
  initialInput = "",
  onSuccess,
  onCancel,
}: AiContentComposerProps) {
  const [step, setStep] = useState<Step>("input");
  const [input, setInput] = useState(initialInput);
  const [draft, setDraft] = useState<RefinedContentDraft | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState("");

  async function handleRefine(text?: string) {
    const trimmed = (text ?? input).trim();
    if (trimmed.length < 3) {
      setError("Descreva a ideia com pelo menos 3 caracteres");
      return;
    }

    setError("");
    setIsRefining(true);

    try {
      const response = await fetch("/api/content/ai-refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Erro ao refinar conteúdo");
      }

      setDraft(data as RefinedContentDraft);
      setStep("review");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao refinar conteúdo",
      );
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
            Revise o rascunho gerado pela IA antes de salvar no pipeline.
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <ContentForm
          draft={draftToContentInput(draft)}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ai-content-input">
          Descreva a ideia de conteúdo em linguagem natural
        </Label>
        <Textarea
          id="ai-content-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex: vídeo sobre como usar o Codex no Windows para automatizar tarefas chatas, formato tutorial Mão na Massa pro YouTube"
          rows={6}
          autoFocus
        />
      </div>

      <p className="text-xs text-muted-foreground">
        A IA vai sugerir título, plataforma, tipo, roteiro, legenda e hashtags
        no tom ZocLabs. Você revisa tudo antes de salvar.
      </p>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          className="flex-1"
          onClick={() => handleRefine()}
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
