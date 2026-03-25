/**
 * POST /api/webhooks/mtn
 * MTN MoMo Collections webhook — receives payment status notifications.
 *
 * MTN sends a callback to this endpoint when:
 *  - A "Request to Pay" is approved (SUCCESSFUL)
 *  - A "Request to Pay" is rejected / times out (FAILED)
 *
 * Payload (MTN Collections v1.0):
 * {
 *   "financialTransactionId": "363440463",
 *   "externalId": "ord_abc123",
 *   "amount": "5000",
 *   "currency": "UGX",
 *   "payer": { "partyIdType": "MSISDN", "partyId": "256700123456" },
 *   "payerMessage": "...",
 *   "payeeNote": "...",
 *   "status": "SUCCESSFUL"
 * }
 */

import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_SECRET = process.env.MTN_WEBHOOK_SECRET ?? "";

interface MoMoWebhookPayload {
  financialTransactionId?: string;
  externalId: string;
  amount: string;
  currency: string;
  payer: {
    partyIdType: string;
    partyId: string;
  };
  payerMessage?: string;
  payeeNote?: string;
  status: "SUCCESSFUL" | "FAILED" | "PENDING";
  reason?: string;
}

export async function POST(req: NextRequest) {
  try {
    if (WEBHOOK_SECRET) {
      const signature = req.headers.get("x-callback-signature") ?? "";
      if (signature !== WEBHOOK_SECRET) {
        console.warn("[MTN Webhook] Invalid signature");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload: MoMoWebhookPayload = await req.json();

    console.log("[MTN Webhook] Received:", JSON.stringify(payload, null, 2));

    const { externalId, status, financialTransactionId, amount, currency, payer } = payload;

    if (!externalId || !status) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    switch (status) {
      case "SUCCESSFUL": {
        console.log(
          `[MTN Webhook] ✅ Payment SUCCESSFUL — Order: ${externalId}, ` +
          `Tx: ${financialTransactionId}, Amount: ${amount} ${currency}, ` +
          `Payer: ${payer?.partyId}`
        );
        // TODO: await convex.mutation(api.orders.markPaid, { orderId: externalId, momoTransactionId: financialTransactionId, amount: Number(amount) });
        break;
      }
      case "FAILED": {
        console.log(
          `[MTN Webhook] ❌ Payment FAILED — Order: ${externalId}, Reason: ${payload.reason ?? "unknown"}`
        );
        // TODO: await convex.mutation(api.orders.markFailed, { orderId: externalId, reason: payload.reason });
        break;
      }
      case "PENDING": {
        console.log(`[MTN Webhook] ⏳ Payment PENDING — Order: ${externalId}`);
        break;
      }
      default:
        console.warn(`[MTN Webhook] Unknown status: ${status}`);
    }

    return NextResponse.json({ received: true, orderId: externalId, status });
  } catch (err: unknown) {
    console.error("[MTN Webhook] Error:", err);
    return NextResponse.json({ received: false }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: "SwiftShopy MTN MoMo Webhook",
    status: "active",
    timestamp: new Date().toISOString(),
  });
}
