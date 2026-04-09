import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function generateTrackingNumber(): string {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TRK-${random}`;
}

async function sendConfirmation(orderNumber: string, trackingNumber: string, total: number, customerEmail: string | null, customerPhone: string | null, items: any[], now: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  try {
    // Send WhatsApp notification
    if (customerPhone) {
      const phone = customerPhone.replace(/\D/g, "");
      await fetch(`${appUrl}/api/notify/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phone,
          message: `*SwiftShopy Order Confirmation*\n\nOrder: ${orderNumber}\nTracking: ${trackingNumber}\nTotal: UGX ${total.toLocaleString()}\n\nTrack: ${appUrl}/track?${trackingNumber}`,
        }),
      });
    }

    // Send Email with invoice
    if (customerEmail) {
      const itemsHTML = items.map((item: any) => 
        `<tr><td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName || item.name}</td><td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td><td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">UGX ${item.price.toLocaleString()}</td><td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">UGX ${(item.price * item.quantity).toLocaleString()}</td></tr>`
      ).join('');

      const invoiceHTML = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #6b21a8;">SwiftShopy</h1>
    <p style="color: #666;">ORDER CONFIRMATION</p>
  </div>
  <div style="margin-bottom: 30px;">
    <p><strong>Order:</strong> ${orderNumber}</p>
    <p><strong>Tracking:</strong> ${trackingNumber}</p>
    <p><strong>Date:</strong> ${new Date(now).toLocaleDateString()}</p>
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
    <thead><tr style="background: #f9f9f9;"><th style="padding: 12px; text-align: left;">Item</th><th style="padding: 12px;">Qty</th><th style="padding: 12px; text-align: right;">Price</th><th style="padding: 12px; text-align: right;">Total</th></tr></thead>
    <tbody>${itemsHTML}</tbody>
  </table>
  <div style="text-align: right; font-size: 18px; margin-bottom: 30px;">
    <strong>Total: UGX ${total.toLocaleString()}</strong>
  </div>
  <div style="text-align: center; color: #666; font-size: 12px; border-top: 2px solid #6b21a8; padding-top: 20px;">
    <p>Track your order: ${appUrl}/track?${trackingNumber}</p>
    <p>Thank you for shopping with SwiftShopy!</p>
  </div>
</body>
</html>`.trim();

      await fetch(`${appUrl}/api/notify/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: customerEmail,
          subject: `Order Confirmation - ${orderNumber}`,
          html: invoiceHTML,
        }),
      });
    }
  } catch (e) {
    console.log("Confirmation send error:", e);
  }
}

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 20, 60000);
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await req.json();
    const { 
      items, 
      customerName, 
      customerPhone, 
      customerEmail, 
      shippingAddress,
      paymentMethod = "mtn_momo",
      storeId 
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart." }, { status: 400 });
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: "Customer name and phone are required." }, { status: 400 });
    }

    const now = Date.now();
    const orderNumber = generateOrderNumber();
    const trackingNumber = generateTrackingNumber();

    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => 
      sum + (item.price * item.quantity), 0);
    const total = subtotal;

    // Create order data to return (simulating database save)
    const orderData = {
      orderId: `order_${now}`,
      orderNumber,
      trackingNumber,
      total,
      subtotal,
      status: "pending",
      paymentMethod,
      paymentStatus: "pending",
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      shippingAddress: shippingAddress || null,
      items: items.map((item: any) => ({
        productId: item.productId || item.id,
        productName: item.productName || item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      })),
      createdAt: now,
    };

    // Send confirmations asynchronously (non-blocking)
    if (customerEmail || customerPhone) {
      setTimeout(() => {
        sendConfirmation(orderNumber, trackingNumber, total, customerEmail, customerPhone, items, now);
      }, 2000);
    }

    return NextResponse.json({
      success: true,
      ...orderData,
      message: "Order created. Proceed to payment.",
    });
  } catch (err: unknown) {
    console.error("[/api/orders/create] Error:", err);
    const message = err instanceof Error ? err.message : "Order creation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    orders: [],
    message: "Order lookup available on tracking page"
  });
}