import { NextResponse } from "next/server";
import { z } from "zod";
import { refineContent } from "@/lib/ai/refine-content";

const requestSchema = z.object({
  input: z.string().min(3, "Descreva a ideia com pelo menos 3 caracteres"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input } = requestSchema.parse(body);
    const draft = await refineContent(input);

    return NextResponse.json(draft);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Entrada inválida" },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Erro ao refinar conteúdo";

    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "Integração com OpenAI não configurada" },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
