import { z } from "zod";
import { TASK_CATEGORIES, TASK_PRIORITIES } from "@/lib/tasks/constants";

export const refinedTaskSchema = z.object({
  title: z.string().describe("Título claro e acionável da tarefa"),
  description: z
    .string()
    .nullable()
    .describe("Descrição resumida com contexto e critério de pronto"),
  priority: z.enum(TASK_PRIORITIES).describe("Prioridade da tarefa"),
  category: z.enum(TASK_CATEGORIES).describe("Categoria da tarefa"),
  due_date: z
    .string()
    .nullable()
    .describe("Data limite no formato YYYY-MM-DD ou null"),
  estimated_minutes: z
    .number()
    .int()
    .positive()
    .nullable()
    .describe("Estimativa em minutos ou null"),
  tags: z.array(z.string()).describe("Tags curtas em minúsculas"),
  checklist: z
    .array(z.string())
    .describe("Subtarefas acionáveis, em ordem lógica de execução"),
});

export type RefinedTaskDraft = z.infer<typeof refinedTaskSchema>;
