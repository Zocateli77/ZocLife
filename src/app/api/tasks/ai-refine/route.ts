import { NextResponse } from "next/server";
import { z } from "zod";
import { refineTask } from "@/lib/ai/refine-task";
import { getProjectOptions } from "@/lib/tasks/queries";

const requestSchema = z.object({
  input: z.string().min(3, "Descreva a tarefa com pelo menos 3 caracteres"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input } = requestSchema.parse(body);
    const projects = await getProjectOptions();
    const draft = await refineTask(input, { projects });

    return NextResponse.json(draft);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Entrada inválida" },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Erro ao refinar tarefa";

    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "Integração com OpenAI não configurada" },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
