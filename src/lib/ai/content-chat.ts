import "server-only";
import OpenAI from "openai";
import { buildSocialManagerPrompt } from "@/lib/ai/zoclabs-brand";

const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_OUTPUT_TOKENS = 2000;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

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

export async function streamContentChat(messages: ChatMessage[]) {
  const openai = new OpenAI({ apiKey: getOpenAIApiKey() });

  return openai.chat.completions.create({
    model: getOpenAIModel(),
    max_tokens: MAX_OUTPUT_TOKENS,
    stream: true,
    messages: [
      { role: "system", content: buildSocialManagerPrompt() },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
  });
}
