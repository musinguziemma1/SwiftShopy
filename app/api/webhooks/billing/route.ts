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
        console.warn("[Billing Webhook] Invalid signature");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload: MoMoWebhookPayload = await req.json();
    console.log("[Billing Webhook] Received:", JSON.stringify(payload, null, 2));

    const { externalId, status, financialTransactionId, amount, currency, payer } = payload;

    if (!externalId || !status) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const payment = await convex.query(api.payments.getPaymentByExternalRef, { externalRef: externalId });
    if (!payment) {
      console.warn(`[Billing Webhook] Payment not found: ${externalId}`);
      return NextResponse.json({ received: true, message: "Payment not found" }, { status: 200 });
    }

    switch (status) {
      case "SUCCESSFUL": {
        console.log(`[Billing Webhook] Payment SUCCESSFUL — Ref: ${externalId}, Tx: ${financialTransactionId}`);
        
        await convex.mutation(api.payments.updatePaymentStatus, {
          id: payment._id,
          status: "success",
          providerRef: financialTransactionId,
        });

        const now = Date.now();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        const subscription = await convex.query(api.subscriptions.getByUser, { userId: payment.userId });

        if (subscription) {
          const newEndDate = subscription.endDate > now 
            ? subscription.endDate + thirtyDays 
            : now + thirtyDays;
          
          await convex.mutation(api.subscriptions.upgradePlan, {
            userId: payment.userId,
            storeId: subscription.storeId,
            plan: payment.plan,
          });
        } else {
          await convex.mutation(api.subscriptions.activateSubscription, {
            userId: payment.userId,
            storeId: undefined,
            plan: payment.plan,
            startDate: now,
            endDate: now + thirtyDays,
          });
        }

        const allPayments = await convex.query(api.payments.getUserPayments, { userId: payment.userId });
        const successfulPayments = allPayments.filter(p => p.status === "success");
        if (successfulPayments.length >= 3) {
          await convex.mutation(api.referrals.checkAndGrantReferralBonus, { userId: payment.userId } as any);
        }

        break;
      }
      case "FAILED": {
        console.log(`[Billing Webhook] Payment FAILED — Ref: ${externalId}, Reason: ${payload.reason}`);
        await convex.mutation(api.payments.updatePaymentStatus, {
          id: payment._id,
          status: "failed",
          failureReason: payload.reason,
        });
        break;
      }
      case "PENDING": {
        console.log(`[Billing Webhook] Payment PENDING — Ref: ${externalId}`);
        break;
      }
      default:
        console.warn(`[Billing Webhook] Unknown status: ${status}`);
    }

    return NextResponse.json({ received: true, externalId, status });
  } catch (err) {
    console.error("[Billing Webhook] Error:", err);
    return NextResponse.json({ received: false }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: "SwiftShopy Billing Webhook",
    status: "active",
    timestamp: new Date().toISOString(),
  });
}
