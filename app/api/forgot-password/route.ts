import { NextRequest, NextResponse } from "next/server";

// ─── Forgot Password Email API ─────────────────────────────────────────

interface ForgotPasswordRequest {
  email: string;
  resetLink: string;
}

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

function generateEmailHTML({ email, resetLink }: ForgotPasswordRequest): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
      <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 20px;">
        <span style="font-size: 30px; line-height: 60px;">🔐</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 16px;">SwiftShopy Account Recovery</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Hi there! 👋
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        We received a request to reset the password for your SwiftShopy account associated with <strong>${email}</strong>.
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Click the button below to set a new password:
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
          Reset Password
        </a>
      </div>

      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color: #92400e; font-size: 14px; margin: 0;">
          ⏰ This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
        </p>
      </div>

      <!-- Alternative Link -->
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #7c3aed; font-size: 13px; word-break: break-all; margin: 0;">
          ${resetLink}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        This email was sent by SwiftShopy. If you didn't request a password reset, please ignore this email.
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">
        © ${new Date().getFullYear()} SwiftShopy. All rights reserved.
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
    const { email, resetLink } = body as ForgotPasswordRequest;

    if (!email || !resetLink) {
      return NextResponse.json(
        { error: "Missing required fields: email, resetLink" },
        { status: 400 }
      );
    }

    const subject = "Reset your SwiftShopy password";
    const html = generateEmailHTML(body);

    const resendKey = process.env.RESEND_API_KEY || "";
    const sendgridKey = process.env.SENDGRID_API_KEY || "";

    // Check if any email provider is configured
    if (!resendKey && !sendgridKey) {
      console.log("═══════════════════════════════════════════════════════════");
      console.log("🔐 PASSWORD RESET EMAIL (No email provider configured)");
      console.log("═══════════════════════════════════════════════════════════");
      console.log(`To: ${email}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log("═══════════════════════════════════════════════════════════");

      return NextResponse.json({ 
        success: true, 
        dev: true,
        message: "Reset link generated. Configure RESEND_API_KEY to send emails.",
        resetLink 
      });
    }

    const result = await sendViaResend({ email, subject, html });
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Forgot password email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send reset email" },
      { status: 500 }
    );
  }
}
