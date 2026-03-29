import { NextRequest, NextResponse } from "next/server";

// ─── Admin Invitation Email API ────────────────────────────────────────

interface InvitationRequest {
  email: string;
  role: string;
  inviterName: string;
  inviteLink: string;
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  support: "Support",
  analyst: "Analyst",
};

const roleDescriptions: Record<string, string> = {
  super_admin: "Full access to all platform features, user management, and system configuration",
  admin: "Manage sellers, view transactions, generate reports, and handle orders",
  support: "Handle customer support tickets, view orders, and basic reporting",
  analyst: "View analytics, export reports, and access data insights",
};

async function sendViaResend({ email, subject, html }: { email: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "SwiftShopy <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await response.json();
}

async function sendViaSendGrid({ email, subject, html }: { email: string; subject: string; html: string }) {
  const apiKey = process.env.SENDGRID_API_KEY;

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: process.env.EMAIL_FROM || "noreply@swiftshopy.com", name: "SwiftShopy" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error}`);
  }

  return { success: true };
}

function generateEmailHTML({ email, role, inviterName, inviteLink }: InvitationRequest): string {
  const roleName = roleLabels[role] || role;
  const roleDescription = roleDescriptions[role] || "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
      <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 20px;">
        <span style="font-size: 30px; line-height: 60px;">⚡</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">You're Invited!</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 16px;">Join the SwiftShopy Admin Team</p>
    </div>

    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Hi there! 👋
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        <strong>${inviterName}</strong> has invited you to join <strong>SwiftShopy</strong> as an administrator with the role of <strong>${roleName}</strong>.
      </p>

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #111827; font-size: 18px;">🛡️ ${roleName}</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">${roleDescription}</p>
      </div>

      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">
        Your email: <strong>${email}</strong>
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Click the button below to accept this invitation and create your admin account.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
          Accept Invitation
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0;">
        This invitation expires in 7 days.
      </p>

      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #7c3aed; font-size: 13px; word-break: break-all; margin: 0;">
          ${inviteLink}
        </p>
      </div>
    </div>

    <div style="text-align: center; padding: 24px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        This email was sent by SwiftShopy. If you weren't expecting this invitation, you can safely ignore this email.
      </p>
    </div>

  </div>
</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, inviterName, inviteLink } = body as InvitationRequest;

    if (!email || !role || !inviterName || !inviteLink) {
      return NextResponse.json(
        { error: "Missing required fields: email, role, inviterName, inviteLink" },
        { status: 400 }
      );
    }

    const subject = `${inviterName} invited you to join SwiftShopy as ${roleLabels[role] || role}`;
    const html = generateEmailHTML(body);

    const provider = process.env.EMAIL_PROVIDER || "";
    const resendKey = process.env.RESEND_API_KEY || "";
    const sendgridKey = process.env.SENDGRID_API_KEY || "";

    // Check if any email provider is configured
    if (!resendKey && !sendgridKey) {
      // Development mode - log and return success
      console.log("═══════════════════════════════════════════════════════════");
      console.log("📧 ADMIN INVITATION EMAIL (No email provider configured)");
      console.log("═══════════════════════════════════════════════════════════");
      console.log(`To: ${email}`);
      console.log(`Role: ${roleLabels[role] || role}`);
      console.log(`Invited by: ${inviterName}`);
      console.log(`Link: ${inviteLink}`);
      console.log("═══════════════════════════════════════════════════════════");
      console.log("To send real emails, add to .env.local:");
      console.log("RESEND_API_KEY=re_xxxxx (get from resend.com)");
      console.log("EMAIL_PROVIDER=resend");
      console.log("═══════════════════════════════════════════════════════════");

      return NextResponse.json({ 
        success: true, 
        dev: true,
        message: "Invitation created. Configure RESEND_API_KEY to send emails.",
        inviteLink 
      });
    }

    let result;

    if (resendKey) {
      result = await sendViaResend({ email, subject, html });
    } else if (sendgridKey) {
      result = await sendViaSendGrid({ email, subject, html });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Admin invitation email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send invitation email" },
      { status: 500 }
    );
  }
}
