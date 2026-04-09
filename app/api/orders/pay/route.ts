import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { rateLimit } from "@/lib/rate-limit";
import { requestToPay, normalizeUgandaPhone, isMtnUgandaNumber } from "@/lib/mtn/mtn-momo";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 10, 60000);
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await req.json();
    const { orderNumber, trackingNumber, amount, phone, paymentMethod = "mtn_momo" } = body;

    if (!orderNumber || !amount || !phone) {
      return NextResponse.json({ error: "orderNumber, amount, and phone are required." }, { status: 400 });
    }

    const orders = await convex.query(api.orders.list);
    const order = orders.find((o: any) => o.orderNumber === orderNumber || o.orderNumber.startsWith(orderNumber));

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    let referenceId: string;
    
    if (paymentMethod === "mtn_momo") {
      const msisdn = normalizeUgandaPhone(phone);
      if (!isMtnUgandaNumber(msisdn)) {
        return NextResponse.json({ error: "Phone must be MTN Uganda number." }, { status: 400 });
      }

      referenceId = await requestToPay({
        amount: String(amount),
        currency: "UGX",
        externalId: orderNumber,
        partyId: msisdn,
        partyIdType: "MSISDN",
        payerMessage: `Payment for SwiftShopy Order ${orderNumber}`,
        payeeNote: `Order ${orderNumber}`,
      });
    } else {
      return NextResponse.json({ error: "Payment method not supported yet." }, { status: 400 });
    }

    await convex.mutation(api.orders.updateStatus, {
      id: order._id,
      status: "pending",
      paymentStatus: "pending_confirmation",
    });

    return NextResponse.json({
      success: true,
      referenceId,
      status: "PENDING",
      message: "Payment request sent. Please approve on your phone.",
    });
  } catch (err: unknown) {
    console.error("[/api/orders/pay] Error:", err);
    const message = err instanceof Error ? err.message : "Payment initiation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}