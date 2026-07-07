import "server-only";
import { format } from "date-fns";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  CONTENT_TYPE_LABELS,
  CONTENT_TYPES,
  PLATFORM_LABELS,
  PLATFORMS,
} from "@/lib/content/types";
import {
  refinedContentSchema,
  type RefinedContentDraft,
} from "@/lib/ai/refined-content-schema";
import { ZOCLABS_BRAND_CONTEXT } from "@/lib/ai/zoclabs-brand";

export type { RefinedContentDraft };

const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_OUTPUT_TOKENS = 1200;

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

function buildSystemPrompt() {
  const today = format(new Date(), "yyyy-MM-dd");
  const platforms = PLATFORMS.map(
    (p) => `${p} (${PLATFORM_LABELS[p]})`,
  ).join(", ");
  const contentTypes = CONTENT_TYPES.map(
    (t) => `${t} (${CONTENT_TYPE_LABELS[t]})`,
  ).join(", ");

  return `Você é o assistente de conteúdo do ZocLife (app de produtividade do criador do ZocLabs).
Sua função é transformar uma ideia crua em um rascunho estruturado para o pipeline de produção de conteúdo.

${ZOCLABS_BRAND_CONTEXT}

Regras:
- Responda sempre em português do Brasil.
- Hoje é ${today}.
- Use apenas estes valores de platform: ${platforms}.
- Use apenas estes valores de content_type: ${contentTypes}.
- planned_date deve ser YYYY-MM-DD ou null se não houver data clara no texto.
- hashtags: no máximo 8, minúsculas, sem #, relevantes ao nicho.
- caption: legenda no tom ZocLabs, pronta para copiar, ou null se for só ideia inicial.
- script_text: outline ou roteiro resumido quando fizer sentido, ou null.
- Não invente datas sem indício no texto; prefira null.
- Alinhe o conteúdo a um dos pilares (Mão na Massa, Lab News, Carreira, Cases).`;
}

export async function refineContent(
  rawInput: string,
): Promise<RefinedContentDraft> {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    throw new Error("Descreva a ideia antes de refinar");
  }

  const openai = new OpenAI({ apiKey: getOpenAIApiKey() });

  const completion = await openai.chat.completions.parse({
    model: getOpenAIModel(),
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: `Refine esta ideia de conteúdo:\n\n${trimmed}`,
      },
    ],
    response_format: zodResponseFormat(refinedContentSchema, "refined_content"),
  });

  const parsed = completion.choices[0]?.message?.parsed;
  if (!parsed) {
    throw new Error("A IA não retornou um rascunho válido");
  }

  return parsed;
}
