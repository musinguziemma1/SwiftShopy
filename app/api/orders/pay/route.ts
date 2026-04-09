import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { rateLimit } from "@/lib/rate-limit";
import { requestToPay, normalizeUgandaPhone, isMtnUgandaNumber } from "@/lib/mtn/mtn-momo";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function sendPaymentConfirmation(order: any) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (order.customerPhone) {
    try {
      const phone = order.customerPhone.replace(/\D/g, "");
      await fetch(`${appUrl}/api/notify/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phone,
          message: `✅ Payment Confirmed!\n\nOrder: ${order.orderNumber}\nAmount: UGX ${order.total.toLocaleString()}\n\nTrack: ${appUrl}/track?${order.trackingNumber}`,
        }),
      });
    } catch (e) { console.log("WhatsApp error:", e); }
  }
}

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 10, 60000);
  if (rateLimitResult.limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json();
    const { orderNumber, amount, phone, paymentMethod = "mtn_momo" } = body;

    if (!orderNumber || !amount || !phone) {
      return NextResponse.json({ error: "orderNumber, amount, phone required" }, { status: 400 });
    }

    let order = await convex.query("orders:getByOrderNumber" as any, { orderNumber });
    if (!order) {
      const orders = await convex.query("orders:list" as any);
      order = orders.find((o: any) => o.orderNumber === orderNumber);
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let referenceId: string;
    
    if (paymentMethod === "mtn_momo") {
      const msisdn = normalizeUgandaPhone(phone);
      if (!isMtnUgandaNumber(msisdn)) {
        return NextResponse.json({ error: "Use MTN Uganda number (077, 078, 076)" }, { status: 400 });
      }

      referenceId = await requestToPay({
        amount: String(amount),
        currency: "UGX",
        externalId: orderNumber,
        partyId: msisdn,
        partyIdType: "MSISDN",
        payerMessage: `Pay SwiftShopy Order ${orderNumber}`,
        payeeNote: `Order ${orderNumber}`,
      });

      await convex.mutation("orders:updateStatus" as any, {
        id: order._id,
        status: "paid",
        paymentStatus: "paid",
      });

      setTimeout(() => sendPaymentConfirmation(order), 2000);

      return NextResponse.json({
        success: true,
        referenceId,
        status: "PENDING",
        orderStatus: "paid",
        message: "Payment request sent! Check your phone.",
      });
    } else {
      return NextResponse.json({ error: "Use MTN MoMo" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Payment error:", err);
    return NextResponse.json({ error: err.message || "Payment failed" }, { status: 500 });
  }
}