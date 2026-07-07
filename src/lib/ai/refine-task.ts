import "server-only";
import { format } from "date-fns";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  TASK_CATEGORIES,
  TASK_CATEGORY_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
} from "@/lib/tasks/constants";
import type { ProjectOption } from "@/lib/tasks/types";
import {
  refinedTaskSchema,
  type RefinedTaskDraft,
} from "@/lib/ai/refined-task-schema";

export type { RefinedTaskDraft };

const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_OUTPUT_TOKENS = 800;

function getOpenAIApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return key;
}

function getOpenAIModel() {
  return process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
}

function buildSystemPrompt(projects: ProjectOption[]) {
  const today = format(new Date(), "yyyy-MM-dd");
  const priorities = TASK_PRIORITIES.map(
    (p) => `${p} (${TASK_PRIORITY_LABELS[p]})`,
  ).join(", ");
  const categories = TASK_CATEGORIES.map(
    (c) => `${c} (${TASK_CATEGORY_LABELS[c]})`,
  ).join(", ");
  const projectList =
    projects.length > 0
      ? projects.map((p) => `- ${p.name} (id: ${p.id})`).join("\n")
      : "Nenhum projeto ativo.";

  return `Você é um assistente de produtividade do app ZocLife.
Sua função é transformar texto livre do usuário em uma tarefa bem estruturada.

Regras:
- Responda sempre em português do Brasil.
- Hoje é ${today}.
- Use apenas estes valores de priority: ${priorities}.
- Use apenas estes valores de category: ${categories}.
- due_date deve ser YYYY-MM-DD ou null se não houver prazo claro.
- estimated_minutes deve ser um inteiro positivo ou null.
- checklist deve ter entre 0 e 8 subtarefas, cada uma curta e acionável.
- Se a tarefa for simples, checklist pode ficar vazia.
- Não invente prazos sem indício no texto; prefira null.
- tags: no máximo 5, minúsculas, sem #.

Projetos ativos do usuário (use apenas se o texto indicar claramente um deles):
${projectList}`;
}

export async function refineTask(
  rawInput: string,
  options?: { projects?: ProjectOption[] },
): Promise<RefinedTaskDraft> {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    throw new Error("Descreva a tarefa antes de refinar");
  }

  const openai = new OpenAI({ apiKey: getOpenAIApiKey() });
  const projects = options?.projects ?? [];

  const completion = await openai.chat.completions.parse({
    model: getOpenAIModel(),
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: [
      { role: "system", content: buildSystemPrompt(projects) },
      {
        role: "user",
        content: `Refine esta tarefa:\n\n${trimmed}`,
      },
    ],
    response_format: zodResponseFormat(refinedTaskSchema, "refined_task"),
  });

  const parsed = completion.choices[0]?.message?.parsed;
  if (!parsed) {
    throw new Error("A IA não retornou um rascunho válido");
  }

  return parsed;
}
