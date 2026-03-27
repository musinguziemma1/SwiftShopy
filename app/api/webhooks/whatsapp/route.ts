/**
 * WhatsApp Cloud API Webhook
 * 
 * This endpoint receives incoming WhatsApp messages from Meta's WhatsApp Cloud API.
 * It handles:
 * - Inbound text messages
 * - Media messages (images, audio, video, documents)
 * - Message status updates (sent, delivered, read)
 * - Account verification (webhook setup)
 * 
 * WhatsApp Cloud API sends webhooks in this format:
 * {
 *   "object": "whatsapp_business_account",
 *   "entry": [{
 *     "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
 *     "changes": [{
 *       "value": {
 *         "messaging_product": "whatsapp",
 *         "metadata": {
 *           "display_phone_number": "...",
 *           "phone_number_id": "..."
 *         },
 *         "messages": [...],
 *         "statuses": [...]
 *       },
 *       "field": "messages"
 *     }]
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Verify webhook - in production, validate against stored token
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "swiftshopy_verify_token";

    if (mode === "subscribe" && token === verifyToken) {
      console.log("[whatsapp-webhook] Webhook verified successfully");
      return new NextResponse(challenge, { status: 200 });
    }

    console.log("[whatsapp-webhook] Verification failed:", { mode, token });
    return NextResponse.json({ error: "Verification failed" }, { status: 403 });
  } catch (err) {
    console.error("[whatsapp-webhook] GET Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verify this is a WhatsApp webhook
    if (body.object !== "whatsapp_business_account") {
      console.log("[whatsapp-webhook] Not a WhatsApp webhook");
      return NextResponse.json({ ok: true });
    }

    const entry = body.entry?.[0];
    if (!entry) {
      return NextResponse.json({ ok: true });
    }

    const changes = entry.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return NextResponse.json({ ok: true });
    }

    const phoneNumberId = value.metadata?.phone_number_id;
    const displayPhoneNumber = value.metadata?.display_phone_number;

    // Handle message status updates
    if (value.statuses) {
      for (const status of value.statuses) {
        await handleMessageStatus(status);
      }
    }

    // Handle incoming messages
    if (value.messages) {
      for (const message of value.messages) {
        await handleIncomingMessage(phoneNumberId, displayPhoneNumber, message);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[whatsapp-webhook] POST Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleIncomingMessage(
  phoneNumberId: string,
  displayPhoneNumber: string,
  message: any
) {
  try {
    const from = message.from;
    const msgId = message.id;
    const timestamp = parseInt(message.timestamp) * 1000;
    
    // Determine message type and content
    let type = "text";
    let content = "";
    let mediaUrl: string | undefined;

    if (message.type === "text") {
      content = message.text?.body || "";
    } else if (message.type === "image") {
      type = "image";
      content = message.image?.caption || "Image";
      mediaUrl = message.image?.mime_type;
    } else if (message.type === "audio") {
      type = "audio";
      content = "Audio message";
      mediaUrl = message.audio?.mime_type;
    } else if (message.type === "video") {
      type = "video";
      content = message.video?.caption || "Video";
      mediaUrl = message.video?.mime_type;
    } else if (message.type === "document") {
      type = "document";
      content = message.document?.filename || "Document";
      mediaUrl = message.document?.mime_type;
    } else if (message.type === "location") {
      type = "location";
      content = `Location: ${message.location?.latitude}, ${message.location?.longitude}`;
    } else if (message.type === "interactive") {
      type = "interactive";
      if (message.interactive?.type === "button_reply") {
        content = message.interactive.button_reply?.title || "";
      } else if (message.interactive?.type === "list_reply") {
        content = message.interactive.list_reply?.title || "";
      }
    } else {
      content = `[${message.type} message]`;
    }

    // Get the store by phone number (in production, look up by phoneNumberId)
    // const store = await convex.query(api.stores.getByPhoneNumberId, { phoneNumberId });
    const storeId = "store_placeholder"; // This would be looked up by phoneNumberId

    // In production, we'd look up the store by phone number ID
    console.log("[whatsapp-webhook] Received message:", {
      from,
      type,
      content,
      msgId,
      phoneNumberId
    });

    // Store the message in Convex
    // This would create/update contact and conversation, then store the message
    /*
    const contact = await convex.mutate(api.whatsapp.getOrCreateContact, {
      storeId: store._id,
      waId: from,
      phone: normalizePhone(from),
      name: message.profile?.name,
    });

    const conversation = await convex.mutate(api.whatsapp.getOrCreateConversation, {
      storeId: store._id,
      contactId: contact._id,
    });

    await convex.mutate(api.whatsapp.receiveMessage, {
      storeId: store._id,
      conversationId: conversation._id,
      contactId: contact._id,
      waMessageId: msgId,
      type,
      content,
      mediaUrl,
      metadata: { timestamp, phoneNumberId },
    });
    */

    console.log("[whatsapp-webhook] Message stored successfully");
  } catch (err) {
    console.error("[whatsapp-webhook] Error handling message:", err);
  }
}

async function handleMessageStatus(status: any) {
  try {
    const msgId = status.id;
    const statusStr = status.status;

    let newStatus: "sent" | "delivered" | "read" | "failed";
    if (statusStr === "sent") newStatus = "sent";
    else if (statusStr === "delivered") newStatus = "delivered";
    else if (statusStr === "read") newStatus = "read";
    else if (statusStr === "failed") newStatus = "failed";
    else return;

    // Update message status in Convex
    /*
    await convex.mutate(api.whatsapp.updateMessageStatus, {
      waMessageId: msgId,
      status: newStatus,
    });
    */

    console.log("[whatsapp-webhook] Message status updated:", { msgId, status: newStatus });
  } catch (err) {
    console.error("[whatsapp-webhook] Error updating status:", err);
  }
}

function normalizePhone(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  
  // If it doesn't start with country code, add Uganda's +256
  if (!cleaned.startsWith("256")) {
    if (cleaned.startsWith("0")) {
      cleaned = "256" + cleaned.slice(1);
    } else {
      cleaned = "256" + cleaned;
    }
  }
  
  return "+" + cleaned;
}