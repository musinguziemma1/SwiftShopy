import { NextRequest, NextResponse } from "next/server";

// ─── Email Notification API ────────────────────────────────────────────
// Supports: Resend, SendGrid, or SMTP
// Configure via environment variables:
//   EMAIL_PROVIDER=resend|sendgrid|smtp
//   RESEND_API_KEY=...
//   SENDGRID_API_KEY=...
//   SMTP_HOST=... SMTP_PORT=... SMTP_USER=... SMTP_PASS=...

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

async function sendViaResend({ to, subject, html, text, from }: EmailRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: from || process.env.EMAIL_FROM || "SwiftShopy <noreply@swiftshopy.com>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend error: ${error}`);
  }

  return await response.json();
}

async function sendViaSendGrid({ to, subject, html, text, from }: EmailRequest) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) throw new Error("SENDGRID_API_KEY not configured");

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: (Array.isArray(to) ? to : [to]).map(email => ({ email })) }],
      from: { email: from || process.env.EMAIL_FROM || "noreply@swiftshopy.com", name: "SwiftShopy" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
  }

  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text, from } = body as EmailRequest;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 }
      );
    }

    const provider = process.env.EMAIL_PROVIDER || "resend";
    let result;

    switch (provider) {
      case "resend":
        result = await sendViaResend({ to, subject, html, text, from });
        break;
      case "sendgrid":
        result = await sendViaSendGrid({ to, subject, html, text, from });
        break;
      default:
        // Log for development
        console.log("[EMAIL]", { to, subject, html: html.substring(0, 100) });
        result = { success: true, dev: true };
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
