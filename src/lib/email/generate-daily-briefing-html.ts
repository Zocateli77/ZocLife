import type { DailyBriefingData } from "@/lib/automation/collect-daily-briefing";

export function generateDailyBriefingHtml(data: DailyBriefingData): string {
  const section = (title: string, items: string) => `
    <tr><td style="padding:24px 32px 8px;">
      <h2 style="margin:0;font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#14B8A6;">${title}</h2>
    </td></tr>
    <tr><td style="padding:0 32px 16px;">${items}</td></tr>`;

  const list = (arr: Array<{ title?: string; name?: string }>, key: "title" | "name" = "title") =>
    arr.length
      ? `<ul style="margin:0;padding-left:20px;color:#cfd5e2;">${arr.map((i) => `<li style="margin-bottom:6px;">${i[key] ?? i.title}</li>`).join("")}</ul>`
      : `<p style="margin:0;color:#8A93A6;font-size:14px;">Nada planejado.</p>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0E1726;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0E1726;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#18222F;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
  <tr><td style="padding:32px;text-align:center;background:linear-gradient(135deg,#14B8A6,#0E7C70);">
    <h1 style="margin:0;font-size:24px;color:#0E1726;font-weight:700;">Zoc<span style="color:#fff;">Life</span></h1>
    <p style="margin:8px 0 0;color:#062a25;font-size:14px;">Seu plano de hoje</p>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="margin:0 0 4px;font-size:20px;color:#fff;font-weight:600;">${data.greeting}</p>
    <p style="margin:0 0 8px;color:#8A93A6;font-size:14px;">${data.date}</p>
    <p style="margin:0 0 24px;color:#cfd5e2;font-size:15px;line-height:1.6;">
      Você tem <strong style="color:#14B8A6;">${data.summary.totalTasks} tarefas</strong>,
      <strong style="color:#14B8A6;">${data.summary.totalHabits} hábitos</strong>,
      <strong style="color:#14B8A6;">${data.summary.totalEvents} eventos</strong>
      ${data.summary.totalWorkouts ? ` e <strong style="color:#F59E0B;">1 treino</strong>` : ""}.
      Comece pelo que mais move sua vida hoje.
    </p>
  </td></tr>
  ${section("Tarefas de hoje", list(data.tasks))}
  ${section("Compromissos", data.events.length ? `<ul style="margin:0;padding-left:20px;color:#cfd5e2;">${data.events.map((e) => `<li>${e.time} — ${e.title}</li>`).join("")}</ul>` : `<p style="color:#8A93A6;">Sem compromissos.</p>`)}
  ${section("Hábitos", `<ul style="margin:0;padding-left:20px;color:#cfd5e2;">${data.habits.map((h) => `<li>${h.done ? "✅" : "⬜"} ${h.name}</li>`).join("")}</ul>`)}
  ${data.workout ? section("Treino", `<p style="color:#cfd5e2;margin:0;">${data.workout.done ? "✅" : "💪"} ${data.workout.title}</p>`) : ""}
  ${data.reading ? section("Leitura", `<p style="color:#cfd5e2;margin:0;">📖 ${data.reading.book} — ${data.reading.progress}</p>`) : ""}
  ${data.overdue.length ? section("Atrasados", list(data.overdue)) : ""}
  <tr><td style="padding:24px 32px 32px;text-align:center;">
    <a href="${data.appUrl}" style="display:inline-block;background:#14B8A6;color:#0E1726;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">Abrir Zoc Life</a>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}
