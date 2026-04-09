import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { requestToPay, normalizeUgandaPhone, isMtnUgandaNumber } from "@/lib/mtn/mtn-momo";

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 10, 60000);
  if (rateLimitResult.limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { orderNumber, trackingNumber, amount, phone, paymentMethod = "mtn_momo" } = body;

    if (!orderNumber || !amount || !phone) {
      return NextResponse.json({ error: "orderNumber, amount, and phone are required" }, { status: 400 });
    }

    // Find order in memory storage
    const order = global.orderStorage?.get(orderNumber) || global.orderStorage?.get(trackingNumber);
    
    if (!order) {
      return NextResponse.json({ error: "Order not found. Please place an order first." }, { status: 404 });
    }

    let referenceId: string;
    
    if (paymentMethod === "mtn_momo") {
      const msisdn = normalizeUgandaPhone(phone);
      if (!isMtnUgandaNumber(msisdn)) {
        return NextResponse.json({ error: "Phone must be MTN Uganda number (07x, 078x, 077x)" }, { status: 400 });
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

      // Update order status in memory
      if (global.orderStorage) {
        const updatedOrder = { ...order, paymentStatus: "pending_confirmation", status: "paid" };
        global.orderStorage.set(orderNumber, updatedOrder);
        global.orderStorage.set(trackingNumber, updatedOrder);
      }

      return NextResponse.json({
        success: true,
        referenceId,
        status: "PENDING",
        message: "Payment request sent! Check your phone and approve.",
      });
    } else {
      return NextResponse.json({ error: "Payment method not supported" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[/api/orders/pay] Error:", err);
    return NextResponse.json({ error: err.message || "Payment failed" }, { status: 500 });
  }
}