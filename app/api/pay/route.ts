/**
 * POST /api/pay
 * Initiates an MTN MoMo "Request to Pay" for an order.
 *
 * Body: { orderId, amount, phone, storeName, items }
 * Returns: { referenceId, status: "PENDING" }
 */

import { NextRequest, NextResponse } from "next/server";
import { requestToPay, normalizeUgandaPhone, isMtnUgandaNumber } from "@/lib/mtn/mtn-momo";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Apply rate limiting - 10 requests per minute for payments
  const rateLimitResult = rateLimit(req, 10, 60000);
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": "0",
        }
      }
    );
  }
  
  try {
    const body = await req.json();
    const { orderId, amount, phone, storeName, items } = body;

    // ── Validation ──
    if (!orderId || !amount || !phone) {
      return NextResponse.json(
        { error: "orderId, amount, and phone are required." },
        { status: 400 }
      );
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const msisdn = normalizeUgandaPhone(phone);

    if (!isMtnUgandaNumber(msisdn)) {
      return NextResponse.json(
        { error: "Phone number must be an MTN Uganda number (076x, 077x, 078x, 039x)." },
        { status: 400 }
      );
    }

    // ── Initiate Request to Pay ──
    const itemsSummary = Array.isArray(items)
      ? items.map((i: { name: string; qty: number }) => `${i.name} x${i.qty}`).join(", ")
      : "SwiftShopy order";

    const referenceId = await requestToPay({
      amount: String(amount),
      currency: "UGX",
      externalId: orderId,
      partyId: msisdn,
      partyIdType: "MSISDN",
      payerMessage: `Payment for ${storeName ?? "SwiftShopy"}: ${itemsSummary}`,
      payeeNote: `Order ${orderId} from ${storeName ?? "SwiftShopy"}`,
    });

    return NextResponse.json({
      referenceId,
      status: "PENDING",
      message: "Payment request sent to your phone. Please approve on MTN MoMo.",
    });
  } catch (err: unknown) {
    console.error("[/api/pay] Error:", err);
    const message = err instanceof Error ? err.message : "Payment initiation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
