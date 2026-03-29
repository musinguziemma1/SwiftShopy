import { NextRequest, NextResponse } from "next/server";

// ─── WhatsApp Notification API ─────────────────────────────────────────
// Uses WhatsApp Business Cloud API
// Configure via environment variables:
//   WHATSAPP_PHONE_NUMBER_ID=...
//   WHATSAPP_ACCESS_TOKEN=...
//   WHATSAPP_API_VERSION=v18.0

interface WhatsAppRequest {
  to: string; // Phone number with country code (e.g., "256700000000")
  message: string;
  templateName?: string;
  templateParams?: string[];
}

async function sendWhatsAppMessage({ to, message, templateName, templateParams }: WhatsAppRequest) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v18.0";

  if (!phoneNumberId || !accessToken) {
    throw new Error("WhatsApp credentials not configured");
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  let payload: any;

  if (templateName) {
    // Send template message
    payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: templateParams ? [{
          type: "body",
          parameters: templateParams.map(param => ({ type: "text", text: param })),
        }] : [],
      },
    };
  } else {
    // Send text message
    payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${error}`);
  }

  return await response.json();
}

// ─── Notification Templates ────────────────────────────────────────────
const templates: Record<string, (params: any) => string> = {
  new_order: (p) => `🛒 New Order!\n\nOrder #${p.orderNumber}\nCustomer: ${p.customerName}\nTotal: UGX ${p.total}\n\nItems: ${p.items}\n\nView your dashboard for details.`,
  
  order_paid: (p) => `✅ Payment Received!\n\nOrder #${p.orderNumber} has been paid.\nAmount: UGX ${p.total}\n\nThank you for your business!`,
  
  order_failed: (p) => `❌ Payment Failed\n\nOrder #${p.orderNumber} payment failed.\nPlease contact the customer or try again.`,
  
  new_user: (p) => `👋 New User Registered!\n\n${p.name} (${p.email}) just signed up as a ${p.role}.\n\nWelcome them to SwiftShopy!`,
  
  low_stock: (p) => `⚠️ Low Stock Alert!\n\n"${p.productName}" has only ${p.stock} units remaining.\nConsider restocking soon.`,
  
  out_of_stock: (p) => `🚨 Out of Stock!\n\n"${p.productName}" is now out of stock.\nRestock to continue accepting orders.`,
  
  payment_success: (p) => `💰 Payment Confirmed!\n\n${p.provider} payment of UGX ${p.amount} received successfully.\n\nTransaction ID: ${p.transactionId}`,
  
  payment_failed: (p) => `❌ Payment Failed\n\n${p.provider} payment of UGX ${p.amount} failed.\n\nPlease retry or contact support.`,
  
  subscription_created: (p) => `🎉 Subscription Activated!\n\nYour ${p.plan} plan is now active.\n\nEnjoy your new features!`,
  
  subscription_expiring: (p) => `⏰ Subscription Expiring Soon\n\nYour ${p.plan} plan expires in ${p.daysRemaining} days.\n\nRenew now to keep your premium features.`,
  
  referral_bonus: (p) => `🎁 Referral Bonus Earned!\n\nCongratulations! You've earned ${p.reward} for your referral.\n\nKeep sharing to earn more!`,
  
  store_created: (p) => `🏪 Store Created!\n\nYour store "${p.storeName}" has been created successfully.\n\nStart adding products now!`,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, templateName, templateParams } = body as WhatsAppRequest & { templateParams?: any };

    if (!to) {
      return NextResponse.json(
        { error: "Missing required field: to" },
        { status: 400 }
      );
    }

    // If templateName provided, use template message
    let finalMessage = message;
    if (templateName && templates[templateName] && templateParams) {
      finalMessage = templates[templateName](templateParams);
    }

    if (!finalMessage) {
      return NextResponse.json(
        { error: "Missing message or template" },
        { status: 400 }
      );
    }

    // Format phone number (remove + if present, ensure country code)
    let phoneNumber = to.replace(/\s/g, "").replace(/^\+/, "");
    if (!phoneNumber.startsWith("256")) {
      // Assume Uganda if no country code
      phoneNumber = "256" + phoneNumber.replace(/^0/, "");
    }

    const result = await sendWhatsAppMessage({
      to: phoneNumber,
      message: finalMessage,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send WhatsApp message" },
      { status: 500 }
    );
  }
}
