import "server-only";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const from = process.env.GMAIL_FROM_EMAIL;

  if (!clientId || !clientSecret || !refreshToken || !from) {
    console.warn("Gmail not configured — skipping email send");
    return { skipped: true };
  }

  const { google } = await import("googleapis");
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2 });

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
  ].join("\r\n");

  const encoded = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encoded },
  });

  return { sent: true };
}

type NotificationPayload = {
  channel: "email" | "whatsapp";
  to: string;
  subject?: string;
  html?: string;
  text?: string;
};

export async function sendNotification(payload: NotificationPayload): Promise<{ sent?: boolean; skipped?: boolean }> {
  if (payload.channel === "email") {
    return sendEmail({
      to: payload.to,
      subject: payload.subject ?? "Zoc Life",
      html: payload.html ?? "",
    });
  }
  if (payload.channel === "whatsapp") {
    throw new Error("WhatsApp not implemented yet");
  }
  return { skipped: true };
}
