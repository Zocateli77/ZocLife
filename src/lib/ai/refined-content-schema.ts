import { z } from "zod";
import { CONTENT_TYPES, PLATFORMS } from "@/lib/content/types";

export const refinedContentSchema = z.object({
  title: z.string().describe("Título claro e acionável do conteúdo"),
  description: z
    .string()
    .nullable()
    .describe("Descrição resumida com contexto, pilar e objetivo"),
  platform: z.enum(PLATFORMS).describe("Plataforma de destino"),
  content_type: z.enum(CONTENT_TYPES).describe("Formato do conteúdo"),
  caption: z
    .string()
    .nullable()
    .describe("Legenda pronta para publicar ou null"),
  cta: z
    .string()
    .nullable()
    .describe("Chamada para ação ou null"),
  hashtags: z
    .array(z.string())
    .describe("Hashtags curtas em minúsculas, sem #, máximo 8"),
  script_text: z
    .string()
    .nullable()
    .describe("Roteiro ou outline do conteúdo ou null"),
  planned_date: z
    .string()
    .nullable()
    .describe("Data planejada de gravação/publicação YYYY-MM-DD ou null"),
});

export type RefinedContentDraft = z.infer<typeof refinedContentSchema>;
