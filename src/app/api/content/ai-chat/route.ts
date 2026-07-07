import { z } from "zod";
import { streamContentChat } from "@/lib/ai/content-chat";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1, "Envie pelo menos uma mensagem"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = requestSchema.parse(body);

    const stream = await streamContentChat(messages);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Entrada inválida" },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Erro no chat de conteúdo";

    if (message.includes("OPENAI_API_KEY")) {
      return Response.json(
        { error: "Integração com OpenAI não configurada" },
        { status: 503 },
      );
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
