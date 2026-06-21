import { NextResponse } from "next/server";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DEFAULT_USER_ID } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { collectDailyBriefingData } from "@/lib/automation/collect-daily-briefing";
import { generateDailyBriefingHtml } from "@/lib/email/generate-daily-briefing-html";
import { sendNotification } from "@/lib/notifications/send-notification";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.DAILY_BRIEFING_SECRET;

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const startedAt = new Date().toISOString();

  const { data: logEntry } = await supabase
    .from("automation_logs")
    .insert({
      user_id: DEFAULT_USER_ID,
      automation_name: "daily_email_briefing",
      status: "running",
      started_at: startedAt,
    })
    .select()
    .single();

  try {
    const data = await collectDailyBriefingData();
    const html = generateDailyBriefingHtml(data);
    const subject = `Zoc Life — Seu plano de hoje, ${format(new Date(), "d 'de' MMMM", { locale: ptBR })}`;
    const to = process.env.DAILY_BRIEFING_TO_EMAIL ?? process.env.APP_LOGIN_EMAIL ?? "";

    const result = await sendNotification({
      channel: "email",
      to,
      subject,
      html,
    });

    const skipped = result?.skipped ?? false;

    await supabase
      .from("automation_logs")
      .update({
        status: skipped ? "skipped" : "success",
        finished_at: new Date().toISOString(),
        metadata: { subject, to, skipped },
      })
      .eq("id", logEntry?.id);

    return NextResponse.json({
      success: true,
      skipped,
      summary: data.summary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await supabase
      .from("automation_logs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_message: message,
      })
      .eq("id", logEntry?.id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
