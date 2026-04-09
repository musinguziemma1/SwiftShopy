import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { requestToPay, normalizeUgandaPhone, isMtnUgandaNumber } from "@/lib/mtn/mtn-momo";

function notifySellerOfPayment(orderData: any, appUrl: string) {
  if (!orderData.sellerIds) return;
  
  for (const sellerId of orderData.sellerIds) {
    if (sellerId && global.sellerOrders?.has(sellerId)) {
      const orders = global.sellerOrders.get(sellerId);
      const orderIdx = orders?.findIndex((o: any) => o.orderNumber === orderData.orderNumber);
      if (orderIdx !== undefined && orderIdx >= 0) {
        orders![orderIdx].paymentStatus = "paid";
        orders![orderIdx].status = "paid";
        orders![orderIdx].updatedAt = Date.now();
      }
    }
  }
}

function notifyAdminOfPayment(orderData: any) {
  if (global.allOrders) {
    const orderIdx = global.allOrders.findIndex((o: any) => o.orderNumber === orderData.orderNumber);
    if (orderIdx >= 0) {
      global.allOrders[orderIdx].paymentStatus = "paid";
      global.allOrders[orderIdx].status = "paid";
      global.allOrders[orderIdx].updatedAt = Date.now();
    }
  }
}

async function sendPaymentConfirmation(orderData: any) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const now = Date.now();

  // Send WhatsApp to customer
  if (orderData.customerPhone) {
    try {
      const phone = orderData.customerPhone.replace(/\D/g, "");
      await fetch(`${appUrl}/api/notify/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phone,
          message: `✅ *Payment Confirmed!*\n\nOrder: ${orderData.orderNumber}\nAmount: UGX ${orderData.total.toLocaleString()}\n\nYour order is being processed. Track: ${appUrl}/track?${orderData.trackingNumber}`,
        }),
      });
    } catch (e) { console.log("WhatsApp error:", e); }
  }

  // Send email receipt
  if (orderData.customerEmail) {
    try {
      const itemsHTML = orderData.items.map((item: any) => 
        `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td><td style="padding: 10px; text-align: center;">${item.quantity}</td><td style="padding: 10px; text-align: right;">UGX ${item.price.toLocaleString()}</td><td style="padding: 10px; text-align: right;">UGX ${item.total.toLocaleString()}</td></tr>`
      ).join('');

      const receiptHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 20px;"><h1 style="color: #22c55e;">✅ Payment Receipt</h1></div>
  <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #22c55e;">
    <p><strong>Order:</strong> ${orderData.orderNumber}</p>
    <p><strong>Tracking:</strong> ${orderData.trackingNumber}</p>
    <p><strong>Date:</strong> ${new Date(now).toLocaleString()}</p>
  </div>
  <table style="width: 100%; border-collapse: collapse;"><thead><tr style="background: #22c55e; color: white;"><th style="padding: 10px;">Item</th><th style="padding: 10px;">Qty</th><th style="padding: 10px;">Price</th><th style="padding: 10px;">Total</th></tr></thead><tbody>${itemsHTML}</tbody></table>
  <div style="text-align: right; font-size: 20px; margin-top: 20px; color: #22c55e;"><strong>Paid: UGX ${orderData.total.toLocaleString()}</strong></div>
  <p style="text-align: center; margin-top: 30px; color: #666;">Track: ${appUrl}/track?${orderData.trackingNumber}</p>
</body></html>`;

      await fetch(`${appUrl}/api/notify/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: orderData.customerEmail, subject: `Payment Confirmed - ${orderData.orderNumber}`, html: receiptHTML }),
      });
    } catch (e) { console.log("Email error:", e); }
  }
}

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 10, 60000);
  if (rateLimitResult.limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { orderNumber, trackingNumber, amount, phone, paymentMethod = "mtn_momo" } = body;

    if (!orderNumber || !amount || !phone) {
      return NextResponse.json({ error: "orderNumber, amount, phone required" }, { status: 400 });
    }

    const order = global.orderStorage?.get(orderNumber) || global.orderStorage?.get(trackingNumber);
    
    if (!order) {
      return NextResponse.json({ error: "Order not found. Place an order first." }, { status: 404 });
    }

    let referenceId: string;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
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
        payerMessage: `Pay SwiftShopy Order ${orderNumber} - UGX ${Number(amount).toLocaleString()}`,
        payeeNote: `Order ${orderNumber}`,
      });

      // Update order status
      const updatedOrder = { ...order, paymentStatus: "pending_confirmation", status: "paid", updatedAt: Date.now() };
      global.orderStorage?.set(orderNumber, updatedOrder);
      global.orderStorage?.set(trackingNumber, updatedOrder);
      
      // Update seller orders
      notifySellerOfPayment(updatedOrder, appUrl);
      
      // Update admin orders
      notifyAdminOfPayment(updatedOrder);

      // Send payment confirmation
      setTimeout(() => sendPaymentConfirmation(updatedOrder), 2000);

      return NextResponse.json({
        success: true,
        referenceId,
        status: "PENDING",
        orderStatus: "paid",
        message: "💰 Payment request sent! Check your phone and approve.",
      });
    } else {
      return NextResponse.json({ error: "Use MTN MoMo payment" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Payment error:", err);
    return NextResponse.json({ error: err.message || "Payment failed" }, { status: 500 });
  }
}