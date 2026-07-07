"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  LineChart,
  MessageCircle,
  Palette,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ContentForm } from "@/components/content/content-form";
import type { RefinedContentDraft } from "@/lib/ai/refined-content-schema";
import type { ContentInput } from "@/lib/content/actions";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AiContentChatProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

type Step = "chat" | "review";

const QUICK_PROMPTS = [
  {
    icon: Calendar,
    label: "Planejar semana",
    prompt: "Me ajuda a planejar o calendário de conteúdo desta semana para o ZocLabs.",
  },
  {
    icon: FileText,
    label: "Legenda ou roteiro",
    prompt: "Quero escrever uma legenda ou roteiro. Me faz 2–3 perguntas rápidas antes de começar.",
  },
  {
    icon: Palette,
    label: "Briefing de arte",
    prompt: "Preciso de um briefing de arte (carrossel ou thumbnail) no estilo ZocLabs.",
  },
  {
    icon: MessageCircle,
    label: "Responder comentário",
    prompt: "Tenho um comentário/DM para responder no tom do ZocLabs. Vou colar em seguida.",
  },
  {
    icon: LineChart,
    label: "Analisar métricas",
    prompt: "Vou colar métricas de um post/vídeo para você interpretar e sugerir ajustes.",
  },
] as const;

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

export function AiContentChat({ onSuccess, onCancel }: AiContentChatProps) {
  const [step, setStep] = useState<Step>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<RefinedContentDraft | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isStreaming]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/content/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Erro no assistente",
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Resposta inválida do assistente");

      const decoder = new TextDecoder();
      const accumulatedRef = { text: "" };

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedRef.text = `${accumulatedRef.text}${decoder.decode(value, { stream: true })}`;
        const snapshot = accumulatedRef.text;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = {
              role: "assistant",
              content: snapshot,
            };
          }
          return updated;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no assistente");
      setMessages((prev) =>
        prev[prev.length - 1]?.role === "assistant" &&
        prev[prev.length - 1]?.content === ""
          ? prev.slice(0, -1)
          : prev,
      );
    } finally {
      setIsStreaming(false);
    }
  }

  async function handleCreatePipeline(sourceText: string) {
    const trimmed = sourceText.trim();
    if (trimmed.length < 3) {
      setError("Texto insuficiente para criar no pipeline");
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
        err instanceof Error ? err.message : "Erro ao criar no pipeline",
      );
    } finally {
      setIsRefining(false);
    }
  }

  function handleBackToChat() {
    setStep("chat");
    setDraft(null);
    setError("");
  }

  if (step === "review" && draft) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Revise o rascunho antes de salvar no pipeline.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBackToChat}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar ao chat
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
    <div className="flex h-[min(70vh,560px)] flex-col gap-3">
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3"
      >
        {messages.length === 0 && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Bora! Sou o assistente de social media do ZocLabs. Escolha um
              atalho ou digite sua pergunta.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={isStreaming}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50 disabled:opacity-50"
                >
                  <Icon className="h-4 w-4 shrink-0 text-teal-text" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={`${msg.role}-${i}`}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] space-y-2 rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-teal-text/15 text-foreground"
                  : "bg-background border border-border"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === "assistant" && msg.content && !isStreaming && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={isRefining}
                  onClick={() => handleCreatePipeline(msg.content)}
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  {isRefining ? "Gerando..." : "Criar no pipeline"}
                </Button>
              )}
            </div>
          </div>
        ))}

        {isStreaming &&
          messages[messages.length - 1]?.role === "assistant" &&
          !messages[messages.length - 1]?.content && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Pensando...
            </p>
          )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Pergunte sobre ideias, legendas, briefings..."
          rows={2}
          disabled={isStreaming}
          className="min-h-0 resize-none"
        />
        <Button
          type="button"
          size="icon"
          className="shrink-0 self-end"
          onClick={() => sendMessage(input)}
          disabled={isStreaming || !input.trim()}
          aria-label="Enviar mensagem"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {onCancel && (
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Fechar
        </Button>
      )}
    </div>
  );
}
