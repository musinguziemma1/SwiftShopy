/**
 * POST /api/webhooks/mtn
 * MTN MoMo Collections webhook — receives payment status notifications.
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const WEBHOOK_SECRET = process.env.MTN_WEBHOOK_SECRET ?? "";
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");

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

    // Find order by orderNumber
    const order = await convex.query(api.orders.getByOrderNumber, { orderNumber: externalId });
    if (!order) {
      console.warn(`[MTN Webhook] Order not found: ${externalId}`);
      return NextResponse.json({ received: true, message: "Order not found" }, { status: 200 });
    }

    switch (status) {
      case "SUCCESSFUL": {
        console.log(`[MTN Webhook] Payment SUCCESSFUL — Order: ${externalId}, Tx: ${financialTransactionId}`);
        await convex.mutation(api.orders.updateStatus, { id: order._id, status: "paid" });
        // Log transaction
        await convex.mutation(api.transactions.create, {
          orderId: order._id,
          storeId: order.storeId,
          amount: Number(amount) || order.total,
          currency: currency || "UGX",
          provider: "mtn_momo",
          providerRef: financialTransactionId || "",
          externalRef: externalId,
          status: "successful",
          customerPhone: payer?.partyId || order.customerPhone,
          metadata: { webhook: true, timestamp: Date.now() },
        });
        break;
      }
      case "FAILED": {
        console.log(`[MTN Webhook] Payment FAILED — Order: ${externalId}, Reason: ${payload.reason}`);
        await convex.mutation(api.orders.updateStatus, { id: order._id, status: "failed" });
        // Log failed transaction
        await convex.mutation(api.transactions.create, {
          orderId: order._id,
          storeId: order.storeId,
          amount: Number(amount) || order.total,
          currency: currency || "UGX",
          provider: "mtn_momo",
          providerRef: financialTransactionId || "",
          externalRef: externalId,
          status: "failed",
          customerPhone: payer?.partyId || order.customerPhone,
          metadata: { webhook: true, reason: payload.reason, timestamp: Date.now() },
        });
        break;
      }
      case "PENDING": {
        console.log(`[MTN Webhook] Payment PENDING — Order: ${externalId}`);
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
